//This script gives a sprite a random color when it's spawned
#pragma strict

//The list of colors to choose from 
var colors:Color[];

function Start() 
{
	//Choose a random color from the list and assign it to the sprite
	if ( colors.Length > 0 )    gameObject.GetComponent(SpriteRenderer).color = colors[Mathf.Floor(Random.value * colors.Length)];
}
