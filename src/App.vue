<template>
  <div class="app">
    <ElevatorShift         
      v-for="item in cages"
      :key="item"
      :cageState="item" />
    <div class="controls">
      <FloorControlPanel 
        v-for="(item, index) in floors.slice().reverse()"
        :key="item"
        :floorNumber="floors.length - index" />
    </div>
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex';

import ElevatorShift from "./components/ElevatorShift.vue";
import FloorControlPanel from "./components/FloorControlPanel.vue";

export default {
  name: 'App',
  components: {
    ElevatorShift,
    FloorControlPanel,
  },
  computed: {
    ...mapState([
      'cages',
      'floors'
    ])
  },
  methods: {
    saveAppState() {
      this.saveState();
    },
    loadAppState() {
      this.loadState();
    },
    ...mapActions(['cagesStartMoving','saveState','loadState','setNewBasicState'])
  },
  mounted() {
    this.setNewBasicState( {numberOfFloors: 5, numberOfCages: 1});

    this.loadAppState();
    window.addEventListener('beforeunload', this.saveAppState);
    localStorage.clear();

    this.cagesStartMoving();
  }
}
</script>

<style lang="scss">

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  display: flex;
  border: 2px solid grey;
  width: 1200px;
  margin: 50px auto;
}

.controls {
  flex: 1;
}

</style>
