<template>
  <div class="status-badge" :class="{ 'status-badge--loading': isLoading }">
    <span class="status-dot" :class="statusClass"></span>
    <span class="status-text">{{ displayText }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { heatSyncCalendar } from '../../services/calendarService'
import { format } from 'date-fns'

const isOpen = ref(false)
const isLoading = ref(true)
const events = ref<any[]>([])
let statusIntervalId: number | undefined
let eventIntervalId: number | undefined

const statusClass = computed(() => {
  if (isLoading.value) return 'status-dot--loading'
  if (isOpen.value) return 'status-dot--open'
  return 'status-dot--closed'
})

const displayText = computed(() => {
  if (isLoading.value) return 'Checking...'
  if (isOpen.value) return 'OPEN'

  // When closed, show next opening time if available
  const now = new Date()
  const upcomingOpenHours = events.value
    .filter(event => {
      const eventStart = new Date(event.start)
      const eventTitle = event.title.toLowerCase()
      return eventStart > now && eventTitle.includes('open hours')
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  if (upcomingOpenHours.length > 0) {
    const nextOpen = new Date(upcomingOpenHours[0].start)
    const day = format(nextOpen, 'EEE')
    const time = format(nextOpen, 'ha').toLowerCase()
    return `Closed • Opens ${day} ${time}`
  }

  return 'CLOSED'
})

const checkDoorStatus = async () => {
  try {
    isLoading.value = true
    const response = await fetch('https://members.heatsynclabs.org/space_api.json')
    const data = await response.json()
    isOpen.value = data.open === true
  } catch (error) {
    console.error('Failed to fetch door status:', error)
    // Fallback to checking calendar events
    checkCalendarStatus()
  } finally {
    isLoading.value = false
  }
}

const checkCalendarStatus = () => {
  const now = new Date()
  const openEvent = events.value.find(event => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    const eventTitle = event.title.toLowerCase()

    if (eventTitle.includes('open hours')) {
      return now >= eventStart && now <= eventEnd
    }
    return false
  })

  isOpen.value = !!openEvent
}

const fetchEvents = async () => {
  try {
    const allEvents = await heatSyncCalendar.getAllEvents(7) // Get next week
    events.value = allEvents
  } catch (error) {
    console.error('Failed to fetch events for lab status:', error)
  }
}

onMounted(() => {
  // Initial load
  checkDoorStatus()
  fetchEvents()

  // Check door status every 2 minutes
  statusIntervalId = window.setInterval(checkDoorStatus, 2 * 60 * 1000)

  // Refresh events every 30 minutes
  eventIntervalId = window.setInterval(fetchEvents, 30 * 60 * 1000)

  // Add console command for testing
  ;(window as any).toggleDoorStatus = () => {
    isOpen.value = !isOpen.value
    isLoading.value = false
    console.log(`Door status toggled to: ${isOpen.value ? 'OPEN' : 'CLOSED'}`)
    return isOpen.value ? 'OPEN' : 'CLOSED'
  }

  // Add console command to set specific status
  ;(window as any).setDoorStatus = (status: boolean) => {
    isOpen.value = status
    isLoading.value = false
    console.log(`Door status set to: ${isOpen.value ? 'OPEN' : 'CLOSED'}`)
    return isOpen.value ? 'OPEN' : 'CLOSED'
  }

  console.log('%c🛠️ Debug Commands Available:', 'color: #d35f35; font-weight: bold; font-size: 14px')
  console.log('%ctoggleDoorStatus() - Toggle between open/closed', 'color: #7a8b7f')
  console.log('%csetDoorStatus(true/false) - Set specific status', 'color: #7a8b7f')
})

onUnmounted(() => {
  if (statusIntervalId) window.clearInterval(statusIntervalId)
  if (eventIntervalId) window.clearInterval(eventIntervalId)
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid var(--accent-sage);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: var(--accent-sage);
  font-family: var(--font-mono);
  transition: all var(--transition-fast);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: background-color var(--transition-base);
}

.status-dot--loading {
  background: var(--warm-gray);
  animation: pulse 2s ease-in-out infinite;
}

.status-dot--open {
  background: var(--accent-sage);
  animation: pulse 2s ease-in-out infinite;
}

.status-dot--closed {
  background: var(--warm-gray);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.status-text {
  font-family: var(--font-mono);
  font-size: 11px;
}

/* Hover effect */
.status-badge:hover {
  background: rgba(122, 139, 127, 0.05);
  cursor: default;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .status-badge {
    font-size: 10px;
    padding: 3px 8px;
  }

  .status-dot {
    width: 5px;
    height: 5px;
  }

  .status-text {
    font-size: 10px;
  }
}
</style>