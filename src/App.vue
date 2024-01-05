<script setup lang="ts">

import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import SuperTicTacToe from './components/SuperTicTacToe.vue'
import TicTacToe from './components/TicTacToe.vue'



</script>

<template>
  <TabView>
    <TabPanel header="TicTacToe">
      <TicTacToe />
    </TabPanel>
    <TabPanel header="Super TicTacToe">
      <SuperTicTacToe />
    </TabPanel>
  </TabView>
</template>

<style scoped></style>
