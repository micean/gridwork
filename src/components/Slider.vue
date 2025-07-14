<template>
  <div class="slider-container" :class="{ disabled: disabled }">
    <div class="slider-track" ref="trackRef" @click="handleTrackClick">
      <div class="slider-fill" :style="{ width: fillWidth }"></div>
      <div
        class="slider-thumb"
        ref="thumbRef"
        :style="{ left: thumbPosition }"
        @mousedown="handleMouseDown"
        @touchstart="handleTouchStart"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <div class="slider-tooltip" v-if="showTooltip && (isDragging || isHovering)">
          {{ formatValue(displayValue) }}
        </div>
      </div>
    </div>
    <div class="slider-labels" v-if="showLabels">
      <span class="slider-min">{{ formatValue(min) }}</span>
      <span class="slider-value"> </span>
      <span class="slider-max">{{ formatValue(max) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showLabels?: boolean
  showTooltip?: boolean
  format?: (value: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  showLabels: true,
  showTooltip: false,
  format: (value: number) => value.toString()
})

const modelValue = defineModel<number>({ default: 0 })

const emit = defineEmits<{
  change: [value: number]
  input: [value: number]
}>()

const trackRef = ref<HTMLElement>()
const thumbRef = ref<HTMLElement>()
const isDragging = ref(false)
const isHovering = ref(false)
const trackWidth = ref(0)
const trackLeft = ref(0)

const normalizedValue = computed(() => {
  return Math.max(props.min, Math.min(props.max, modelValue.value))
})

const percentage = computed(() => {
  const range = props.max - props.min
  return ((normalizedValue.value - props.min) / range) * 100
})

const fillWidth = computed(() => `${percentage.value}%`)
const thumbPosition = computed(() => `${percentage.value}%`)

const displayValue = computed(() => {
  return Math.round(normalizedValue.value * 100) / 100
})

const formatValue = (value: number) => {
  return props.format(value)
}

const updateValue = (clientX: number) => {
  if (!trackRef.value || props.disabled) return

  const rect = trackRef.value.getBoundingClientRect()
  const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width))
  const newPercentage = offsetX / rect.width
  const range = props.max - props.min
  let newValue = props.min + newPercentage * range

  if (props.step > 0) {
    newValue = Math.round(newValue / props.step) * props.step
  }

  newValue = Math.max(props.min, Math.min(props.max, newValue))

  if (newValue !== modelValue.value) {
    modelValue.value = newValue
    emit('input', newValue)
    emit('change', newValue)
  }
}

const handleMouseDown = (event: MouseEvent) => {
  if (props.disabled) return
  isDragging.value = true
  event.preventDefault()
}

const handleTouchStart = (event: TouchEvent) => {
  if (props.disabled) return
  isDragging.value = true
  event.preventDefault()
}

const handleMouseEnter = () => {
  if (!props.disabled) {
    isHovering.value = true
  }
}

const handleMouseLeave = () => {
  isHovering.value = false
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  updateValue(event.clientX)
}

const handleTouchMove = (event: TouchEvent) => {
  if (!isDragging.value) return
  updateValue(event.touches[0].clientX)
}

const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false
  }
}

const handleTrackClick = (event: MouseEvent) => {
  if (props.disabled) return
  updateValue(event.clientX)
}

const updateTrackDimensions = () => {
  if (trackRef.value) {
    const rect = trackRef.value.getBoundingClientRect()
    trackWidth.value = rect.width
    trackLeft.value = rect.left
  }
}

onMounted(() => {
  updateTrackDimensions()
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('touchmove', handleTouchMove)
  window.addEventListener('touchend', handleMouseUp)
  window.addEventListener('resize', updateTrackDimensions)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('touchend', handleMouseUp)
  window.removeEventListener('resize', updateTrackDimensions)
})
</script>

<style scoped lang="scss">
.slider-container {
  width: 100%;
  padding-top: 20px;
  user-select: none;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .slider-track {
    position: relative;
    width: 100%;
    height: 6px;
    background-color: #e0e0e0;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #d0d0d0;
    }

    .slider-fill {
      position: absolute;
      height: 100%;
      background: linear-gradient(90deg, #007bff, #0056b3);
      border-radius: 3px;
      transition: width 0.2s ease;
    }

    .slider-thumb {
      position: absolute;
      top: 50%;
      width: 20px;
      height: 20px;
      background-color: #007bff;
      border: 2px solid #fff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      cursor: grab;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

      &:hover {
        transform: translate(-50%, -50%) scale(1.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      &:active {
        cursor: grabbing;
        transform: translate(-50%, -50%) scale(1.2);
      }

      .slider-tooltip {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;

        &::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: #333;
        }
      }
    }
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    font-size: 12px;
    color: #666;

    .slider-value {
      font-weight: bold;
      color: #007bff;
    }
  }
}

@media (max-width: 768px) {
  .slider-container {
    padding: 15px 0;

    .slider-thumb {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
