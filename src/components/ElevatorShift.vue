<template>
  <div class="shift">
    <div v-for="(item,index) in floors"
    :key="index"
    class="floor">
      <div class="doors">

      </div>
    </div>
    <ElevatorShiftCage :cageState="cageState"/>
  </div>
</template>

<script>
import {mapState} from 'vuex';

import ElevatorShiftCage from "./ElevatorShiftCage.vue";

export default {
  name: 'ElevatorShift',

  components: {
    ElevatorShiftCage
  },

  props: {
    cageState: Object,
  },

  computed: {
      ...mapState(['floors'])
  }
}
</script>

<style lang="scss" scoped>
@import '@/constants.scss';
  .shift {
    width: $full-shif-width;
    position: relative;
  }
  .floor {
    height: $floor-height;
    border-bottom: 1px solid grey; 
  }

  .doors {
    width: $shift-width;
    height: $floor-height;
    margin: 0 $wall-width;
    border-left: 2px solid grey;
    border-right: 2px solid grey;
  }
</style>
