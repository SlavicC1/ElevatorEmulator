<template>
  <div class="floor">
    <div class="panel">
      {{floorNumber}}
      <FloorControlPanelButton :floorNumber="floorNumber"/>
    </div>
  </div>
</template>

<script>
import FloorControlPanelButton from './FloorControlPanelButton.vue';

export default {
  name: 'FloorControlPanel',

  props: {
    floorNumber: Number
  },

  components: {
    FloorControlPanelButton
  }
}
</script>

<style lang="scss" scoped>
@import '@/constants.module.scss';
.floor {
  width: 100%;
  border-bottom: 1px solid grey;
  height: $floor-height;
}

.panel {
  text-align: center;
  line-height: 2;
  width: $button-size *2;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
