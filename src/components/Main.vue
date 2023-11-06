<template>
  <div class="container" ref="container">
    <div class="target">Moveable</div>

  </div>
</template>
<script setup lang="ts">

import Moveable, {OnDrag, OnResize, OnRotate,OnScale} from "moveable";
import {onMounted, ref} from "vue";

const container = ref()

onMounted(() => {
  const moveableOptions: any = {
    target: document.querySelector(`.target`),
    zoom: 0.8,
    draggable: true,
    clippable: false,
    throttleDrag: 0,
    resizable: true,
    throttleResize: 0,
    scalable: false,
    throttleScale: 0,
    keepRatio: true,
    rotatable: true,
    throttleRotate: 0,
    renderDirections: ["n", "nw", "ne", "s", "se", "sw", "e", "w"],
  }


  const moveable = new Moveable(document.body, moveableOptions);
  moveable.renderDirections = ["nw", "ne", "sw", "se"];

  moveable
      .on("drag", (ev: OnDrag) => {
        ev.target.style.transform = ev.transform;
      })
      .on("resize", (ev: OnResize) => {
        moveable.keepRatio = false
        ev.target.style.width = `${ev.width}px`;
        ev.target.style.height = `${ev.height}px`;
      })
      .on("scale", (ev: OnScale) => {
        ev.target.style.transform = ev.drag.transform;
      })
      .on("rotate", (ev: OnRotate) => {
        console.log(ev);
        ev.target.style.transform = ev.drag.transform;
      })

})

</script>
