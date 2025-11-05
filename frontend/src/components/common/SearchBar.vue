<template>
  <div
    class="search-bar"
    :class="{ compact: size === 'compact', large: size === 'large' }"
    role="search"
  >
    <!-- スコープ選択（不要なら showScope=false で非表示） -->
    <select
      v-if="showScope"
      class="search-scope"
      :value="scope"
      @change="$emit('update:scope', ($event.target as HTMLSelectElement).value)"
      aria-label="検索スコープ"
    >
      <option v-for="opt in normalizedScopeOptions" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>

    <!-- キーワード入力（v-model） -->
    <input
      class="search-input"
      type="text"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keydown.enter="$emit('submit')"
      aria-label="検索キーワード"
    />

    <!-- 送信 -->
    <button class="search-submit" type="button" @click="$emit('submit')" aria-label="検索">
      🔍
    </button>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue'

type ScopeOption = { label: string; value: string }

const props = withDefaults(defineProps<{
  modelValue: string
  scope?: string
  showScope?: boolean
  scopeOptions?: Array<ScopeOption | string>
  placeholder?: string
  size?: 'large' | 'compact'
}>(), {
  modelValue: '',
  scope: undefined,
  showScope: true,
  scopeOptions: () => [],
  placeholder: 'キーワードで検索',
  size: 'compact'
})

const normalizedScopeOptions = computed<ScopeOption[]>(() =>
  (props.scopeOptions || []).map((o: any) =>
    typeof o === 'string' ? { label: o, value: o } : o
  )
)

defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:scope', value: string): void
  (e: 'submit'): void
}>()
</script>
<style src="@/styles/components/SearchBar.css"></style>