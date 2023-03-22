import { faker } from "@faker-js/faker";
//Generador de productos randoms con faker
const generateFaker = () => {
  const array = [];
  for (let i = 0; i <= 4; i++) {
    const product = {
      title: faker.commerce.product(),
      price: faker.commerce.price(),
      thumbnail: faker.image.imageUrl(),
    };
    array.push(product);
  }
  // console.log(array);

  return array;
};

export default generateFaker;
