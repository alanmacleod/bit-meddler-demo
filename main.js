
import bitmeddler from 'bit-meddler';

const WIDTH = 480, HEIGHT = 360, BIT_DEPTH = 4; // 32-bit

const bm = new bitmeddler(WIDTH * HEIGHT);

let lctx = document.getElementById('cleft').getContext('2d');
let rctx = document.getElementById('cright').getContext('2d');

load_img_into_canvas(lctx, './img/homer_car_1_480px.jpg');
load_img_into_canvas(rctx, './img/homer_car_2_480px.jpg');


let timer = window.setInterval(fizzle, 50);


function fizzle()
{
  let ldat = lctx.getImageData(0, 0, WIDTH, HEIGHT);
  let rdat = rctx.getImageData(0, 0, WIDTH, HEIGHT);

  let L = ldat.data, R = rdat.data;
  let o;

  // Do 2000 pixels at a time so we don't hold the browser UI thread up too much
  for (let i=0; i<2000; i++)
  {

    // Here, we're just using bit-meddler to generate a buffer offset
    // but you can easily get a pair of X & Y pixel coordinates with some
    // modulus division
    o = bm.next();

    if (o == null)
      break;

     o *= BIT_DEPTH; // AGBR; = 4 bytes

    // Swap the pixels ES6 style
    [L[o + 0], R[o + 0]] = [R[o + 0], L[o + 0]];
    [L[o + 1], R[o + 1]] = [R[o + 1], L[o + 1]];
    [L[o + 2], R[o + 2]] = [R[o + 2], L[o + 2]];
    [L[o + 3], R[o + 3]] = [R[o + 3], L[o + 3]];

  }

  lctx.putImageData(ldat, 0, 0);
  rctx.putImageData(rdat, 0, 0);

  if (o == null)
  {
    window.clearInterval(timer);

    window.setTimeout(() => {
        bm.reset(); // reset bit-meddler for another pass!
        timer = window.setInterval(fizzle, 50);
    }, 2000);

  }
}



function load_img_into_canvas(ctx, file)
{
  let img1 = new Image();
  img1.onload = () => {
    ctx.drawImage(img1, 0, 0);
  }
  img1.src = file;
}
