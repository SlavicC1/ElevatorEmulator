<template>
  <div @click="onClick"
    :class="floors[floorNumber - 1] ? 'button active' : 'button'">
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
    ...mapState(['floors'])
  },

  methods: {
    onClick() {
      this.active = true;
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

.button:hover {
  cursor: pointer;
}

.button:active {
  transform: scale(1.1);
}

</style>
