export function moveTowards(person, destinationPosition, speed) {
  let distanceToTravelX = destinationPosition.x - person.position.x;
  let distanceToTravelY = destinationPosition.y - person.position.y;

  let distance = Math.sqrt(distanceToTravelX ** 2 + distanceToTravelY ** 2);

  if (distance <= speed) {
    // If we are close enough, just set the position to the destination
    person.position.x = destinationPosition.x;
    person.position.y = destinationPosition.y;
  } else {
    // Normalize the distance to travel
    let normalizedX = distanceToTravelX / distance;
    let normalizedY = distanceToTravelY / distance;

    // Move the person
    person.position.x += normalizedX * speed;
    person.position.y += normalizedY * speed;

    // Recaculate the distance to travel
    distanceToTravelX = destinationPosition.x - person.position.x;
    distanceToTravelY = destinationPosition.y - person.position.y;
    distance = Math.sqrt(distanceToTravelX ** 2 + distanceToTravelY ** 2);
  }

  return distance;
}
