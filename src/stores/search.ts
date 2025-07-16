import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
  const searchQuery = ref('')
  const isSearchVisible = ref(false)

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const clearSearchQuery = () => {
    searchQuery.value = ''
  }

  const setSearchVisible = (value: boolean) => {
    isSearchVisible.value = value
  }

  const highlight = (text: string) => {
    if(!searchQuery.value) return false;
    return text.toLowerCase().includes(searchQuery.value.toLowerCase());
  }

  return {
    searchQuery,
    isSearchVisible,
    setSearchQuery,
    clearSearchQuery,
    setSearchVisible,
    highlight,
  }
})
