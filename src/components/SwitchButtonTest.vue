<template>
  <div class="test-container">
    <h2>开关按钮测试</h2>
    
    <div class="test-section">
      <h3>基础用法</h3>
      <SwitchButton v-model="switch1" />
      <span class="status">状态: {{ switch1 ? '开启' : '关闭' }}</span>
    </div>

    <div class="test-section">
      <h3>多个开关</h3>
      <div class="switch-group">
        <div class="switch-item">
          <SwitchButton v-model="switch2" />
          <span>开关 2: {{ switch2 }}</span>
        </div>
        <div class="switch-item">
          <SwitchButton v-model="switch3" />
          <span>开关 3: {{ switch3 }}</span>
        </div>
        <div class="switch-item">
          <SwitchButton v-model="switch4" />
          <span>开关 4: {{ switch4 }}</span>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h3>不同尺寸展示</h3>
      <div class="size-demo">
        <SwitchButton v-model="switch5" />
        <SwitchButton v-model="switch6" style="transform: scale(1.2);" />
        <SwitchButton v-model="switch7" style="transform: scale(0.8);" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SwitchButton from './SwitchButton.vue'

const switch1 = ref(false)
const switch2 = ref(true)
const switch3 = ref(false)
const switch4 = ref(true)
const switch5 = ref(false)
const switch6 = ref(true)
const switch7 = ref(false)
</script>

<style scoped lang="scss">
.test-container {
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

h3 {
  color: #666;
  margin-bottom: 15px;
  font-size: 16px;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.status {
  margin-left: 15px;
  color: #1890ff;
  font-weight: bold;
}

.switch-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.switch-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.size-demo {
  display: flex;
  align-items: center;
  gap: 30px;
}
</style>