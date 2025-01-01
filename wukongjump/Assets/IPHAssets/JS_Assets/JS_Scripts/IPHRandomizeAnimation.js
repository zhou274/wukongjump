//This script randomizes an object's animation speed, and time offset
#pragma strict

//This script requires an animation to be attached to the object
@script RequireComponent(Animation)

//The random speed range
var randomSpeed:Vector2 = Vector2(0.5,1);

//Should the time of the animation be randomized?
var randomOffset:boolean = true;

function Start() 
{
	//Set the speed of the animation to a random number between randomSpeed.x and randomSpeed.y
	GetComponent.<Animation>()[GetComponent.<Animation>().clip.name].speed = Random.Range(randomSpeed.x, randomSpeed.y);
	
	if ( randomOffset == true )
	{
		//Choose a random time from the animation
		GetComponent.<Animation>()[GetComponent.<Animation>().clip.name].time = Random.Range(0, GetComponent.<Animation>().clip.length);
		
		//Enable the animation
		GetComponent.<Animation>()[GetComponent.<Animation>().clip.name].enabled = true;
		
		//Sample the animation at the current time
		GetComponent.<Animation>().Sample();
		
		//Disable the animation
		GetComponent.<Animation>()[GetComponent.<Animation>().clip.name].enabled = false;
		
		//Play the animation from the new time we sampled
		GetComponent.<Animation>().Play();
	}
}
