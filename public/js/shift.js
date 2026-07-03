'use strict';

const circleCount = 150;
const circlePropCount = 8;
const circlePropsLength = circleCount * circlePropCount;
const baseSpeed = 0.1;
const rangeSpeed = 1;
const baseTTL = 150;
const rangeTTL = 200;
const baseRadius = 100;
const rangeRadius = 200;
const rangeHue = 60;
const xOff = 0.0015;
const yOff = 0.0015;
const zOff = 0.0015;
const backgroundColor = 'hsla(0,0%,5%,1)';

let container;
let canvas;
let ctx;
let circles;
let circleProps;
let simplex;
let baseHue;
let animationId;

function setup() {
  if (animationId) window.cancelAnimationFrame(animationId);

  container = document.querySelector('.content--canvas');

  // If the canvas already exists (persisted via transition:persist), reuse it.
  // Otherwise create a fresh one.
  const existingCanvas = container && container.querySelector('canvas');
  if (!existingCanvas) {
    createCanvas();
  } else {
    // Restore references to the existing persisted canvases
    canvas = {
      a: existingCanvas
    };
    ctx = {
      a: canvas.a.getContext('2d')
    };
  }

  resize();
  initCircles();
  draw();
}

function initCircles() {
  circleProps = new Float32Array(circlePropsLength);
  simplex = new SimplexNoise();
  baseHue = 220;

  let i;

  for (i = 0; i < circlePropsLength; i += circlePropCount) {
    initCircle(i);
  }
}

function initCircle(i) {
  let x, y, n, t, speed, vx, vy, life, ttl, radius, hue;

  x = rand(canvas.a.width);
  y = rand(canvas.a.height);
  n = simplex.noise3D(x * xOff, y * yOff, baseHue * zOff);
  t = rand(TAU);
  speed = baseSpeed + rand(rangeSpeed);
  vx = speed * cos(t);
  vy = speed * sin(t);
  life = 0;
  ttl = baseTTL + rand(rangeTTL);
  radius = baseRadius + rand(rangeRadius);
  hue = baseHue + n * rangeHue;

  circleProps.set([x, y, vx, vy, life, ttl, radius, hue], i);
}

function updateCircles() {
  let i;

  baseHue++;

  for (i = 0; i < circlePropsLength; i += circlePropCount) {
    updateCircle(i);
  }
}

function updateCircle(i) {
  let i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i;
  let x, y, vx, vy, life, ttl, radius, hue;

  x = circleProps[i];
  y = circleProps[i2];
  vx = circleProps[i3];
  vy = circleProps[i4];
  life = circleProps[i5];
  ttl = circleProps[i6];
  radius = circleProps[i7];
  hue = circleProps[i8];

  drawCircle(x, y, life, ttl, radius, hue);

  life++;

  circleProps[i] = x + vx;
  circleProps[i2] = y + vy;
  circleProps[i5] = life;

  (checkBounds(x, y, radius) || life > ttl) && initCircle(i);
}

function drawCircle(x, y, life, ttl, radius, hue) {
  ctx.a.save();
  ctx.a.fillStyle = `hsla(${hue},60%,30%,${fadeInOut(life,ttl)})`;
  ctx.a.beginPath();
  ctx.a.arc(x,y, radius, 0, TAU);
  ctx.a.fill();
  ctx.a.closePath();
  ctx.a.restore();
}

function checkBounds(x, y, radius) {
  return (
    x < -radius ||
    x > canvas.a.width + radius ||
    y < -radius ||
    y > canvas.a.height + radius
  );
}

function createCanvas() {
  container = document.querySelector('.content--canvas');
	canvas = {
		a: document.createElement('canvas')
	};
	canvas.a.style = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		filter: blur(50px);
    background-color: ${backgroundColor};
	`;
	container.appendChild(canvas.a);
	ctx = {
		a: canvas.a.getContext('2d')
	};
}

function resize() {
	const { innerWidth, innerHeight } = window;
	
	canvas.a.width = innerWidth;
  canvas.a.height = innerHeight;
}

function render() {
  // Render logic removed, using CSS blur directly on canvas a
}

function draw() {
  ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);
  updateCircles();
	animationId = window.requestAnimationFrame(draw);
}

// Re-run setup on every page navigation — the canvas is reused if persisted
document.addEventListener('astro:page-load', setup);
window.addEventListener('resize', resize);