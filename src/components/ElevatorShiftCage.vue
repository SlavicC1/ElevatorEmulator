<template>
  <div 
    :class="cageClass" 
    :style="{ bottom: cageState.bottom + 'px' }">
      <div v-if="cageState.state != 'idle'"
        class="cage-indication">
        <div v-if="cageState.direction === 'up'">&uArr;</div>
        <div v-if="cageState.direction === 'down'">&dArr;</div>
        {{cageState.floor}}
      </div>
  </div>
</template>

<script>

export default {
  name: 'ElevatorShiftCage',

  props: {
    cageState: Object,
  },

  computed: {
    cageClass() {
      let classes = [
        'cage',
        this.cageState.state === 'waits' ? 'waiting' : ''
      ];
      return classes.join(' ');
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/constants.scss';
  .cage {
    width: $shift-width;
    height: $floor-height;
    position: relative;
    margin: auto;
    border: 1px solid grey;
    background: blue;
    position: absolute;
    bottom: 0;
    left: $wall-width;
  }

  .waiting {
    background: red;
  }

  .cage-indication {
    width: 20px;
    text-align: center;
    margin: 10px auto;
    border: 1px solid black;
    background: white;
  }
</style>
