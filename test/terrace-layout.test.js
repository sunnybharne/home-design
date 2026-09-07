import { test } from 'node:test';
import assert from 'node:assert/strict';
import { furnishingLayout, furnitureBox } from '../src/furnishing-plan.js';
import { barriers, fixtures, insidePolygon, touchesBox } from '../src/navigation.js';
import { fixedItems } from '../src/interior.js';
import { plan, doors } from '../src/property.js';

const boxes = furnishingLayout.map(furnitureBox);
const terraceDoor = doors.at(-1);

test('a 90 cm route reaches the terrace around the kitchen-side end of the sofa', () => {
  // Drawing-scale clearance, not an as-built passage or accessibility claim.
  // The extra 5 mm covers movement between adjacent 10 mm samples.
  const radius = .45 + .005;
  const openLeaf = [terraceDoor.x-.02, terraceDoor.y, .04, terraceDoor.radius];
  const obstacles = [...barriers, ...fixtures, ...boxes, openLeaf];
  const fridge = fixedItems.find(item => item.id === 'fridge').box;
  const sofa = furnitureBox(furnishingLayout.find(item => item.id === 'sofa'));
  const fridgeCorner = [fridge[0]+fridge[2], fridge[1]];
  const sofaCorner = [sofa[0], sofa[1]+sofa[3]];
  // The diagonal between these corners is the narrowest approach to the rear aisle.
  const midpoint = fridgeCorner.map((value, i) => (value+sofaCorner[i])/2);
  const route = [[3.1,5.84], [fridgeCorner[0],fridgeCorner[1]-radius-.003], midpoint,
    [sofaCorner[0],sofaCorner[1]+radius+.005], [7.7,6.13], [7.7,8.3]];
  for (let leg=1; leg<route.length; leg++) {
    const [ax,az] = route[leg-1], [bx,bz] = route[leg];
    const samples = Math.ceil(Math.hypot(bx-ax,bz-az)/.01);
    for (let i=0; i<=samples; i++) {
      const x=ax+(bx-ax)*i/samples, z=az+(bz-az)*i/samples;
      assert.ok(!obstacles.some(box=>touchesBox(x,z,box,radius)), `narrow route at ${x}, ${z}`);
      for (let a=0; a<36; a++) {
        const px=x+Math.cos(a*Math.PI/18)*radius, pz=z+Math.sin(a*Math.PI/18)*radius;
        assert.ok(insidePolygon(px,pz,plan.outline)||insidePolygon(px,pz,plan.terrace), 'route leaves the home');
      }
    }
  }
});

test('the living furniture clears the nominal terrace door swing', () => {
  // The nominal door leaf swings out onto the terrace. Allow 20 mm thickness.
  for (let angle=terraceDoor.closed; angle<=terraceDoor.open+.001; angle+=Math.PI/180) {
    for (let distance=0; distance<=terraceDoor.radius; distance+=.01) {
      const x=terraceDoor.x+Math.cos(angle)*distance, z=terraceDoor.y+Math.sin(angle)*distance;
      assert.ok(!boxes.some(box=>touchesBox(x,z,box,.03)), 'furniture obstructs the door swing');
    }
  }
});
