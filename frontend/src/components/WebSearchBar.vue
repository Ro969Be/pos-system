<template>
  <div class="aws-search">
    <div class="aws-search__inner">
      <select v-model="category" class="aws-search__cat">
        <option value="">すべて</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <input
        v-model="q"
        :placeholder="placeholder"
        class="aws-search__input"
        @keydown.enter="submit"
        @input="onInput"
      />
      <button class="aws-search__btn" @click="submit" aria-label="検索">
        <span class="aws-search__icon">🔍</span>
      </button>
    </div>

    <!-- サジェスト -->
    <ul v-if="showSuggest && suggestions.length" class="aws-suggest" @mouseleave="showSuggest=false">
      <li v-for="(s,idx) in suggestions" :key="idx" @click="applySuggestion(s)">{{ s }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  categories: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'キーワードで検索' },
  source: { type: Array, default: () => [] } // サジェスト元（title）
});

const emit = defineEmits(['search']);

const q = ref('');
const category = ref('');
const showSuggest = ref(false);

const suggestions = computed(()=>{
  const key = q.value.trim();
  if (!key) return [];
  const uniq = new Set();
  for (const p of props.source) {
    if (p.title && p.title.toLowerCase().includes(key.toLowerCase())) {
      uniq.add(p.title);
      if (uniq.size >= 8) break;
    }
  }
  return [...uniq];
});

const onInput = () => { showSuggest.value = true; };

const submit = () => {
  showSuggest.value = false;
  emit('search', { q: q.value, category: category.value });
};

const applySuggestion = (s) => {
  q.value = s;
  submit();
};
</script>


<style scoped>
.aws-search {
  max-width: 960px;
  margin: 18px auto 8px;
  padding: 8px;
  position: relative; /* for absolute suggest positioning */
}
.aws-search__inner {
  display: grid;
  grid-template-columns: 140px 1fr 56px;
  gap: 0;
  background: #000;
  border-radius: 999px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
}
.aws-search__cat {
  appearance: none;
  border: none;
  border-right: 1px solid #e5e7eb;
  padding: 0 12px;
  font-size: 14px;
  background: #f9fafb;
  color: #111827;
  height: 44px;
}
.aws-search__input {
  border: none;
  outline: none;
  padding: 0 14px;
  font-size: 16px;
  height: 44px;
  color: #111827; /* explicit dark text so it's visible on white */
}
.aws-search__input::placeholder { color: #9ca3af; } /* placeholder visible */
.aws-search__btn {
  border: none;
  height: 44px;
  cursor: pointer;
  font-weight: 700;
}
.aws-search__icon { font-size: 18px; }

/* Suggest dropdown */
.aws-suggest {
  position: absolute;
  top: 60px; /* below the pill */
  left: 16px;
  right: 16px;
  background: #ffffff;
  color: #111827;            /* ensure text is dark on white */
  border-radius: 12px;
  box-shadow: 0 12px 24px rgba(0,0,0,0.25);
  padding: 6px 0;
  list-style: none;
  z-index: 50;
  max-height: 320px;         /* avoid huge panel */
  overflow-y: auto;
  border: 1px solid #e5e7eb;
}
.aws-suggest li {
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  color: #111827;            /* explicit text color */
  background: #ffffff;
}
.aws-suggest li:last-child { border-bottom: none; }
.aws-suggest li:hover { background: #f9fafb; }

@media (max-width: 640px) {
  .aws-search__inner { grid-template-columns: 110px 1fr 52px; }
  .aws-search__cat { height: 42px; font-size: 13px; }
  .aws-search__input { height: 42px; font-size: 15px; }
  .aws-search__btn { height: 42px; }
}
</style>

