import { test } from 'node:test';
import assert from 'node:assert/strict';
import { furnishingLayout, furnitureBox } from '../src/furnishing-plan.js';
import { barriers, fixtures, insidePolygon, touchesBox } from '../src/navigation.js';
import { plan, doors } from '../src/property.js';

const boxes = furnishingLayout.map(furnitureBox);
const terraceDoor = doors.at(-1);
const itemBox = id => furnitureBox(furnishingLayout.find(item => item.id === id));

test('the furnished kitchen-to-terrace route allows a 900 mm envelope in the drawing-scale model', () => {
  // Test an actual route with a wider envelope than the walkthrough avatar.
  // The extra 5 mm covers movement between adjacent 10 mm samples.
  const radius = .455;
  const openLeaf = [terraceDoor.x-.02, terraceDoor.y, .04, terraceDoor.radius];
  const obstacles = [...barriers, ...fixtures, ...boxes, openLeaf];
  const route = [[3.1,5.84], [4.65,5.94], [6.2,5.94], [7.3,6.20], [7.3,8.3]];
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

test('the living group clears the terrace door swing and keeps useful furniture gaps', () => {
  // The nominal door leaf swings out onto the terrace. Allow 20 mm thickness.
  for (let angle=terraceDoor.closed; angle<=terraceDoor.open+.001; angle+=Math.PI/180) {
    for (let distance=0; distance<=terraceDoor.radius; distance+=.01) {
      const x=terraceDoor.x+Math.cos(angle)*distance, z=terraceDoor.y+Math.sin(angle)*distance;
      assert.ok(!boxes.some(box=>touchesBox(x,z,box,.03)), 'furniture obstructs the door swing');
    }
  }
  const sofa=itemBox('sofa'), coffee=itemBox('coffee'), tv=itemBox('tv');
  assert.ok(sofa[0]-(coffee[0]+coffee[2])>=.30, 'coffee table crowds the sofa');
  assert.ok(coffee[0]-(tv[0]+tv[2])>=.30, 'coffee table crowds the TV bench');
  assert.ok(8.39-(sofa[0]+sofa[2])>=.18, 'sofa crowds the window wall');
  assert.ok(7.04-(sofa[1]+sofa[3])>=1.30, 'sofa crowds the terrace approach');
});
