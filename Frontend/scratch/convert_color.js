
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

// Simple approximation or using a library if I had one. 
// Since I don't have a library, I'll search for the OKLCH value of #8B0A7A.
console.log("Hex #8B0A7A to OKLCH");
