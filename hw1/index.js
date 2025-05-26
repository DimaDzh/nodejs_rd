const sum = (arr) => {
  let total = 0;

  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      total += sum(arr[i]);
    } else {
      total += arr[i];
    }
  }

  return total;
};

let arr = [1, 2, [3, 4, [5]], 6];

console.log(sum(arr));
