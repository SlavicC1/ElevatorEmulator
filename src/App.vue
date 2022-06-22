<template>
  <div class="app">
    <ElevatorShift :cageState="cages[0]"/>
    <div class="controls">
      <FloorControlPanel 
        v-for="(item, index) in floors.slice().reverse()"
        :key="index"
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
    ...mapActions(['moveCageToNextFloor'])
  },
  mounted() {
    this.moveCageToNextFloor({cageIndex: 0 });
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
