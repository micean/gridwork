<script setup lang="ts">
import CellContent from './CellContent.vue';
import {computed} from "vue";
import type {CellData} from "../../env";

const props = defineProps<{
  parentPath?: string,
}>()
const model = defineModel<CellData[][]>({ required: true })

const rows = computed(() => model.value.length);
const cols = computed(() => model.value[0]?.length || 0);


</script>

<template>
  <table class="adaptive-table">
    <tbody>
    <tr v-for="row in rows" :key="row">
      <td v-for="col in cols" :key="col" class="table-cell" >
        <CellContent
          :key="model[row - 1][col - 1].id"
          v-model="model[row - 1][col - 1]"
          :path="`${props.parentPath ? props.parentPath + '>' : ''}[${row - 1},${col - 1}]`"
        />
      </td>
    </tr>
    </tbody>
  </table>
</template>

<style scoped lang="scss" src="./TableComponent.scss" />
