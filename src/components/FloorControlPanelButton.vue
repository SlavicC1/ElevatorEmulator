<template>
  <div @click="onClick" :class="buttonClass">
  </div>
</template>

<script>
import {mapActions, mapState} from 'vuex';

export default {
  name: 'FloorControlPanelButton',

  props: {
    floorNumber: Number,
  },

  computed: {
    buttonClass() {
      let classes = {
        off: '', 
        on: 'active',
        waits: 'waits'
      };
      return 'button ' + classes[this.floors[this.floorNumber - 1].state];
    },
    ...mapState(['floors'])
  },

  methods: {
    onClick() {
      if(this.floors[this.floorNumber - 1].state != 'off') return;
      this.addFloorToQueue({floorNumber: this.floorNumber});
      this.moveCageToNextFloor({cageIndex: 0});
    },
    ...mapActions(['addFloorToQueue','moveCageToNextFloor'])
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
