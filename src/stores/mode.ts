import {ref} from "vue";
import {defineStore} from "pinia";

export const useModeStore = defineStore('mode', () => {
  const readonly = ref(false)

  const setReadonly = (value: boolean) => {
    if(readonly.value && !value){
      // 移除url的query
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState(null, '', cleanUrl);
    }
    readonly.value = value
  }

  return {
    readonly,
    setReadonly,
  }
})
