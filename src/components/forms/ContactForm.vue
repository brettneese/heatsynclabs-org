<template>
  <form @submit.prevent="handleSubmit" :class="formClasses">
    <!-- Success State -->
    <div v-if="state === 'success'" class="form-success">
      <div class="success-icon">✓</div>
      <h3 class="success-title">Message Sent!</h3>
      <p class="success-message">{{ successMessage }}</p>
      <button type="button" class="reset-button" @click="resetForm">
        Send Another Message
      </button>
    </div>

    <!-- Form Fields -->
    <template v-else>
      <div class="form-field">
        <label for="name" class="form-label">Name <span class="form-label-required">*</span></label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          class="form-input"
          :class="{ 'form-input--error': errors.name }"
          placeholder="Your name"
          :disabled="state === 'loading'"
        />
        <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
      </div>

      <div class="form-field">
        <label for="email" class="form-label">Email <span class="form-label-required">*</span></label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          class="form-input"
          :class="{ 'form-input--error': errors.email }"
          placeholder="you@example.com"
          :disabled="state === 'loading'"
        />
        <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
      </div>

      <fieldset class="form-field form-fieldset">
        <legend class="form-label">I'm interested in... <span class="form-label-required">*</span></legend>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="formData.interests"
              value="classes"
              :disabled="state === 'loading'"
              class="checkbox-input"
            />
            <span class="checkbox-text">Learning about classes</span>
          </label>
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="formData.interests"
              value="email-updates"
              :disabled="state === 'loading'"
              class="checkbox-input"
            />
            <span class="checkbox-text"
              >Receiving occasional email updates</span
            >
          </label>
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="formData.interests"
              value="connect-member"
              :disabled="state === 'loading'"
              class="checkbox-input"
            />
            <span class="checkbox-text">
              Connecting with a member mentor
              <span class="tooltip-wrapper">
                <i class="fa-solid fa-circle-info tooltip-icon"></i>
                <span class="tooltip-content">
                  Our Member Mentor program pairs newcomers with experienced members who can show you around the space, help you get started on projects, and answer any questions. It's a great way to feel at home at HeatSync!
                </span>
              </span>
            </span>
          </label>
          <div class="conditional-field-wrapper">
            <Transition name="slide-fade">
              <div v-if="showReferredByField" class="conditional-field">
                <input
                  id="referred-by"
                  v-model="formData.referredBy"
                  type="text"
                  class="form-input form-input--nested"
                  :disabled="state === 'loading'"
                  placeholder="Anyone in particular?"
                />
              </div>
            </Transition>
          </div>
        </div>
        <span v-if="errors.interests" class="form-error">{{
          errors.interests
        }}</span>
      </fieldset>

      <div class="form-field">
        <label for="notes" class="form-label"
          >Notes <span class="form-label-optional">(Optional)</span></label
        >
        <textarea
          id="notes"
          v-model="formData.notes"
          class="form-textarea"
          :disabled="state === 'loading'"
          placeholder="What're you working on? What are you interested in?"
        ></textarea>
      </div>

      <!-- Error Message -->
      <div v-if="state === 'error'" class="form-error-message">
        {{ errorMessage }}
      </div>

      <button
        type="submit"
        class="submit-button"
        :class="{ 'submit-button--loading': state === 'loading' }"
        :disabled="state === 'loading'"
      >
        <span v-if="state === 'loading'" class="loading-spinner"></span>
        {{ state === "loading" ? "Sending..." : "Send Message" }}
      </button>
    </template>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
});

const emit = defineEmits<{
  success: [];
}>();

type FormState = "idle" | "loading" | "success" | "error";

const state = ref<FormState>("idle");
const successMessage = ref("");
const errorMessage = ref("");

const formData = ref({
  name: "",
  email: "",
  interests: [] as string[],
  notes: "",
  referredBy: "",
});

const showReferredByField = computed(() =>
  formData.value.interests.includes("connect-member")
);

const errors = ref({
  name: "",
  email: "",
  interests: "",
});

const formClasses = computed(() => [
  "contact-form",
  {
    "contact-form--compact": props.compact,
  },
]);

function validateForm(): boolean {
  let isValid = true;
  errors.value = { name: "", email: "", interests: "" };

  if (!formData.value.name.trim()) {
    errors.value.name = "Please enter your name";
    isValid = false;
  }

  if (!formData.value.email.trim()) {
    errors.value.email = "Please enter your email";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = "Please enter a valid email address";
    isValid = false;
  }

  if (formData.value.interests.length === 0) {
    errors.value.interests = "Please select at least one interest";
    isValid = false;
  }

  return isValid;
}

async function handleSubmit() {
  if (!validateForm()) return;

  state.value = "loading";
  errorMessage.value = "";

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.value.name.trim(),
        email: formData.value.email.trim(),
        interests: formData.value.interests,
        notes: formData.value.notes.trim(),
        referredBy: formData.value.referredBy.trim(),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      state.value = "success";
      successMessage.value =
        data.message || "Thank you! We'll be in touch soon.";
      emit("success");
    } else {
      state.value = "error";
      errorMessage.value =
        data.error || "Something went wrong. Please try again.";
    }
  } catch (error) {
    state.value = "error";
    errorMessage.value =
      "Failed to send message. Please check your connection and try again.";
  }
}

function resetForm() {
  state.value = "idle";
  formData.value = {
    name: "",
    email: "",
    interests: [],
    notes: "",
    referredBy: "",
  };
  errors.value = { name: "", email: "", interests: "" };
  successMessage.value = "";
  errorMessage.value = "";
}
</script>

<style scoped>
.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.contact-form--compact {
  gap: var(--space-4);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.form-label {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--graphite);
  letter-spacing: var(--tracking-wide);
}

.form-input {
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--ink-black);
  background: var(--paper-white);
  border: 1px solid var(--warm-gray);
  border-radius: var(--radius-base);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-rust);
  box-shadow: 0 0 0 3px rgba(168, 90, 60, 0.1);
}

.form-input::placeholder {
  color: var(--warm-gray);
}

.form-input:disabled {
  background: var(--cream);
  cursor: not-allowed;
  opacity: 0.7;
}

.form-input--error {
  border-color: var(--error-red);
}

.form-input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-textarea {
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--ink-black);
  background: var(--paper-white);
  border: 1px solid var(--warm-gray);
  border-radius: var(--radius-base);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  resize: vertical;
  min-height: 120px;
  line-height: var(--leading-relaxed);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--accent-rust);
  box-shadow: 0 0 0 3px rgba(168, 90, 60, 0.1);
}

.form-textarea::placeholder {
  color: var(--warm-gray);
}

.form-textarea:disabled {
  background: var(--cream);
  cursor: not-allowed;
  opacity: 0.7;
}

.form-label-required {
  color: var(--accent-rust);
  font-weight: var(--font-medium);
}

.form-label-optional {
  font-size: var(--text-xs);
  font-weight: var(--font-regular);
  color: var(--graphite);
  letter-spacing: normal;
}

.form-error {
  font-size: var(--text-sm);
  color: var(--error-red);
  font-family: var(--font-sans);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  cursor: pointer;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  margin: 0;
  margin-top: 2px;
  accent-color: var(--accent-rust);
  cursor: pointer;
}

.checkbox-input:disabled {
  cursor: not-allowed;
}

.checkbox-text {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--graphite);
  line-height: var(--leading-normal);
}

.tooltip-wrapper {
  position: relative;
  display: inline-block;
  margin-left: var(--space-1);
}

.tooltip-icon {
  color: var(--warm-gray);
  font-size: var(--text-sm);
  cursor: help;
  transition: color var(--transition-fast);
}

.tooltip-icon:hover {
  color: var(--accent-rust);
}

.tooltip-content {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 260px;
  padding: var(--space-3) var(--space-4);
  background: var(--ink-black);
  color: var(--cream);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  border-radius: var(--radius-base);
  box-shadow: 0 4px 12px var(--shadow-medium);
  z-index: 10;
  transition: opacity var(--transition-fast), visibility var(--transition-fast);
}

.tooltip-content::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--ink-black);
}

.tooltip-wrapper:hover .tooltip-content {
  visibility: visible;
  opacity: 1;
}

.conditional-field-wrapper {
  margin-left: 30px;
  overflow: hidden;
}

.conditional-field {
  padding-top: var(--space-2);
}

.form-input--nested {
  width: 100%;
  font-size: var(--text-sm);
}

/* Slide fade transition */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.form-error-message {
  padding: var(--space-3) var(--space-4);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error-red);
  border-radius: var(--radius-base);
  color: var(--error-red);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
}

.submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-8);
  font-family: var(--font-mono);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  color: var(--cream);
  background: var(--ink-black);
  border: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: var(--button-height);
  box-shadow: 2px 2px 8px var(--shadow-light);
}

.submit-button:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 12px var(--shadow-medium);
}

.submit-button:active:not(:disabled) {
  transform: translate(0, 0);
  box-shadow: 1px 1px 4px var(--shadow-light);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-button--loading {
  background: var(--graphite);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: var(--cream);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Success state */
.form-success {
  text-align: center;
  padding: var(--space-8) var(--space-4);
}

.success-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-4);
  background: var(--success-green);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
}

.success-title {
  font-family: var(--font-sans);
  font-size: var(--text-2xl);
  font-weight: var(--font-medium);
  color: var(--ink-black);
  margin: 0 0 var(--space-2);
}

.success-message {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--graphite);
  margin: 0 0 var(--space-6);
  line-height: var(--leading-relaxed);
}

.reset-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-6);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-wide);
  color: var(--graphite);
  background: transparent;
  border: 1px solid var(--graphite);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--transition-base);
}

.reset-button:hover {
  background: var(--graphite);
  color: var(--cream);
}

/* Compact mode adjustments */
.contact-form--compact .form-input {
  padding: var(--space-2) var(--space-3);
}

.contact-form--compact .submit-button {
  padding: var(--space-3) var(--space-6);
  min-height: 40px;
}

.contact-form--compact .form-success {
  padding: var(--space-6) var(--space-4);
}

.contact-form--compact .success-icon {
  width: 48px;
  height: 48px;
  font-size: var(--text-2xl);
}
</style>
