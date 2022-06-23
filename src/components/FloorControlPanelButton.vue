<template>
  <div @click="onClick" :class="buttonClass">
  </div>
</template>

<script>
import {mapActions, mapState} from 'vuex';
import { FLOOR_STATE } from '@/store';

export default {
  name: 'FloorControlPanelButton',

  props: {
    floorNumber: Number,
  },

  computed: {
    buttonClass() {
      let resultClass = 'button';
      if(this.floors[this.floorNumber - 1].state === FLOOR_STATE.IN_QUEUE) resultClass += ' active';
      if(this.floors[this.floorNumber - 1].state === FLOOR_STATE.WAITS_ELEVATOR) resultClass += ' waits';
      return resultClass;
    },
    ...mapState(['floors'])
  },

  methods: {
    onClick() {
      if(this.floors[this.floorNumber - 1].state != FLOOR_STATE.IDLE) return;
      this.addFloorToQueue({floorNumber: this.floorNumber});
      this.cagesStartMoving();
    },
    ...mapActions(['addFloorToQueue','cagesStartMoving'])
  }
}
</script>

<style lang="scss" scoped>
@import '@/constants.scss';
.button {
  width: $button-size;
  height: $button-size;
  background: blue;
  border-radius: 50%;
  border: $button-border solid white;
  outline: $button-border solid blue;
}

.active {
  background: green;
}

.waits {
  background: red;
}

.button:hover {
  cursor: pointer;
}

.button:active {
  transform: scale(1.1);
}

</style>
