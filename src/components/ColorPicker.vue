<script setup lang="ts">
const backgroundColors = [
  '#ffffff',
  '#f9f9f0',
  '#f3e733',
  '#ffc7c7',
  '#ff9cbd',
  '#9adbff',
  '#fadaff',
  '#b6edb6',
]

interface Emits {
  (e: 'selectColor', color: string): void
}

const model = defineModel<boolean>({ required: true })
const emit = defineEmits<Emits>()

const handleColorSelect = (color: string) => {
  emit('selectColor', color)
  model.value = false
}

const handleClickOutside = (event: Event) => {
  event.stopPropagation()
}
</script>

<template>
  <div v-if="model" class="color-picker" @click="handleClickOutside">
    <div class="popup-content">
      <div class="color-section">
        <div class="color-grid">
          <div
            v-for="color in backgroundColors"
            :key="'bg-' + color"
            class="color-item"
            :style="{ backgroundColor: color }"
            @click="handleColorSelect(color)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.color-picker {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  z-index: 1000;

  .popup-content {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 194px;
    max-width: 90vw;
    padding: 12px;

    .color-section {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .color-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 6px;
        font-weight: 500;
      }

      .color-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 4px;

        .color-item {
          width: 18px;
          height: 18px;
          border-radius: 3px;
          cursor: pointer;
          border: 1px solid #e0e0e0;
          transition: transform 0.2s;

          &:hover {
            transform: scale(1.1);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          }
        }
      }
    }
  }
}
</style>
