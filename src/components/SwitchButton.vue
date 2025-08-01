<template>
  <div 
    class="switch-button" 
    :class="{ active: modelValue }"
    @click="toggle"
  >
    <div class="switch-track">
      <div class="switch-thumb"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
}

interface Emits {
  'update:modelValue': [value: boolean]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped lang="scss">
.switch-button {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 4px;
  user-select: none;
}

.switch-track {
  position: relative;
  width: 44px;
  height: 22px;
  background-color: #d9d9d9;
  border-radius: 11px;
  transition: background-color 0.2s ease;
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s ease, left 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch-button.active .switch-track {
  background-color: #1890ff;
}

.switch-button.active .switch-thumb {
  transform: translateX(22px);
}

.switch-button:hover .switch-track {
  opacity: 0.8;
}

.switch-button:active .switch-thumb {
  width: 22px;
}
</style>