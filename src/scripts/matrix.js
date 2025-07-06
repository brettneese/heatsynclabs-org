const defaultChars = "ABCDEFGHアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダㄥㄖ尺乇爪　乇卩丂ㄩ爪　ᎶㄖㄖᎶㄥ乇　ﾌ卂卩卂几乇丂乇　ㄒ乇乂ㄒヂヅデドバビブベボパピプペポあいうえおくけこさしすせそたちつてとなにぬねのはひふへむめもやゆよらりるれろわをん一二三四五六七八九十零IJKLMNOPRSTUVWXYZabcdefghijklmonpqrstuvwxyz";

export default class MatrixRain {
  constructor({
    font = "monospace",
    charSize = 8,
    chars = defaultChars,
    bg = "black",
    fg = "lime",
    canvas,
    height = 1080,
    width = 1920,
    duration = 65,
  }) {
    // Defining the parameters
    this.font = font;
    this.charSize = charSize;
    this.chars = chars;
    this.bg = bg;
    this.fg = fg;
    this.canvas = canvas;
    this.duration = duration;
    if (!this.canvas) {
      this.canvas = new OffscreenCanvas(width, height);
    }
    this.canvas.width = width;
    this.canvas.height = height;

    this.context = this.canvas.getContext("2d");
    this.size = [this.canvas.width, this.canvas.height];


    this.context.fillStyle = this.bg;
    this.context.fillRect(0, 0, ...this.size);

    // Creating the particles array
    this.particles = [];
    const particleCount =
      (this.size[0] * this.size[1]) / this.charSize ** 2 / 10;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push(this.newParticle());
    }
  }

  newParticle() {
    return {
      x: Math.random() * this.size[0],
      y: -Math.random() * this.size[1] * 2,
      size: Math.floor(
        Math.random() * (this.charSize * 2 - this.charSize / 2) +
          this.charSize / 2
      )
    };
  }

  drawParticles() {
    this.context.fillStyle = this.fg;
    this.particles.forEach((particle) => {
      this.context.font = `${particle.size}px ${this.font}`;
      const randomChar = this.chars[
        Math.floor(Math.random() * this.chars.length)
      ];
      this.context.fillText(randomChar, particle.x, particle.y);
    });
  }

  updateParticles() {
    this.particles.forEach((particle) => {
      if (particle.y > this.size[1]) {
        Object.assign(particle, this.newParticle());
      } else {
        particle.y += particle.size;
      }
    });
  }

  clearCanvas() {
    this.context.globalAlpha = 0.25;
    this.context.fillStyle = this.bg;
    this.context.fillRect(0, 0, ...this.size);
    this.context.globalAlpha = 1;
  }

  play() {
    this.clearCanvas();
    this.drawParticles();
    this.updateParticles();
    setTimeout(() => {
      this.play();
    }, this.duration);
  }
}

export class MatrixCam {
  constructor({
    predictions = [],
    canvas,
    height = 1080,
    width = 1920,
    matrixCanvas,
    backroundImg,
    name,
  }) {
    // Defining the parameters
    this.predictions = predictions;
    this.height = height;
    this.width = width;
    this.canvas = canvas;
    this.canvas.width = width;
    this.canvas.height = height;
    this.matrixCanvas = matrixCanvas;
    this.name = name;
    this.backroundImg = backroundImg;

    this.context = this.canvas.getContext("2d");

    const img = new Image();
    img.src = this.backroundImg;
    img.onload = () => {
      console.log(`img ${this.backroundImg} loaded`);
      this.context.drawImage(img, 0, 0, this.width, this.height);
    };
    this.img = img;
  }

  updateData(camData) {
    if (camData) {
      this.predictions = camData.predictions || [];
      this.height = camData.image?.height || this.height;
      this.width = camData.image?.width || this.width;
    }
  }

  draw() {
    if (!this.img) {
      console.log(`img ${this.name} not loaded`);
      return;
    }
    if (!this.width || !this.height) {
      console.log(`img ${this.name} has zero dimensions`);
      return;
    }

    const area = this.width * this.height;
    const ctx = this.context;
    ctx.drawImage(this.img, 0, 0, this.width, this.height);

    const people = (this.predictions || []).filter(p => {
      const [x, y, w, h] = p.bbox;
      const pArea = w * h;
      return (p.class === 'person') && (p.score > 0.6) && ((pArea / area) < 0.2);
    });

    people.forEach(p => {
      const [x, y, w, h] = p.bbox;
      ctx.strokeStyle = 'orange';
      ctx.lineWidth = 5;
      ctx.strokeRect(x, y, w, h);
      // ctx.fillStyle = 'black';
      // ctx.fillRect(x, y, w, h);
      // crop a section of the matrix rainCanvas to use the rectangle the same position as the person
      ctx.drawImage(this.matrixCanvas, 
        x, y, w, h,
        x, y, w, h
      );
      ctx.fillStyle = 'white';
      const fontSize = h * 0.1;
      ctx.font = `${fontSize}px Arial`;
      ctx.fillText(p.class, x, y + fontSize);
      ctx.fillText((p.score * 100).toFixed(1) + '%', x, y + (fontSize * 2.1));
    });
  }

}

export class MatrixLauncher {
  constructor({
    cams = [],
    io,
  }) {
    this.cams = cams;
    const matrixRain = new window.MatrixRain({});
    matrixRain.play();
    this.matrixRain = matrixRain;
    this.cams.forEach((cam) => {
      cam.matrixCanvas = this.matrixRain.canvas;
    });

    const socket = io('https://hsl-cam-reflector-c1bb8fa26eef.herokuapp.com/', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to the camdata server');
    });
    socket.on('disconnect', () => {
      console.log('Disconnected from the camdata server');
    });
    socket.on('camResults', (data) => {
      cams.forEach(cam => {
        cam.updateData(data[cam.name]);
      });
    });

    this.socket = socket;
    
    function animate() {
      cams.forEach(cam => {
        cam.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();
  }
}

window.MatrixRain = MatrixRain;
window.MatrixCam = MatrixCam;
window.MatrixLauncher = MatrixLauncher;
