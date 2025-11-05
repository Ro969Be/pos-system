<template>
  <div class="tabs">
    <RouterLink to="/public/webshops" class="tab-btn" :class="{ active: $route.name==='webshops' }">ウェブ店舗（Amazon風）</RouterLink>
    <RouterLink to="/public/shops" class="tab-btn" :class="{ active: $route.name==='shops-food' }">飲食店（食べログ風）</RouterLink>
    <RouterLink to="/public/salons" class="tab-btn" :class="{ active: $route.name==='salons' }">サロン（Hot Pepper Beauty風）</RouterLink>
  </div>
</template>

<script setup>
// purely presentational shared tabs
</script>
