//This script defines an item which can be picked up. When picked up, it can run a function or update a PlayerPrefs value.
#pragma strict

//The tag of the object that can touch this item
var hitTargetTag:String = "Player";

//A list of functions that run when this item is touched by the target
var hitFunctions:HitFunction[];

public class HitFunction
{
	//The name of the function that will run
	var functionName:String = "CancelMove";
	
	//The tag of the target that the function will run on
	var targetTag:String = "Player";
	
	//A parameter that is passed along with the function
	var functionParameter:float = 0;
}

//The playerprefs record name that is affected when picking up this item
var playerPrefsName:String;

//The value change of the playerprefs record when picking up this item
var playerPrefsValue:float;

//The effect that is created at the location of this object when it is destroyed
var hitEffect:Transform;

//The sound that plays when this object is touched
var soundHit:AudioClip;
var soundSourceTag:String = "GameController";

//This function runs when this obstacle touches another object with a trigger collider
function OnTriggerEnter2D(other:Collider2D) 
{	
	//Check if the object that was touched has the correct tag
	if ( other.tag == hitTargetTag )
	{
		//Go through the list of functions and runs them on the correct targets
		for ( var touchFunction in hitFunctions )
		{
			//Check that we have a target tag and function name before running
			if ( touchFunction.targetTag != String.Empty && touchFunction.functionName != String.Empty )
			{
				//Run the function
				GameObject.FindGameObjectWithTag(touchFunction.targetTag).SendMessage(touchFunction.functionName, touchFunction.functionParameter);
			}
		}
		
		//If there is a playerprefs record and a value change, change it
		if ( playerPrefsName != String.Empty && playerPrefsValue != 0 )
		{
			//Get the current value of the player prefs record
			var tempValue = PlayerPrefs.GetFloat( playerPrefsName, 0);
			
			//Update the record with the new value
			PlayerPrefs.SetFloat( playerPrefsName, tempValue + playerPrefsValue);
		}
		
		//If there is a hit effect, create it
		if ( hitEffect )    Instantiate( hitEffect, transform.position, Quaternion.identity);
		
		//Destroy the item
		Destroy(gameObject);
		
		//If there is a sound source and a sound assigned, play it
		if ( soundSourceTag != "" && soundHit )    
		{
			//Reset the pitch back to normal
			GameObject.FindGameObjectWithTag(soundSourceTag).GetComponent.<AudioSource>().pitch = 1;
			
			//Play the sound
			GameObject.FindGameObjectWithTag(soundSourceTag).GetComponent.<AudioSource>().PlayOneShot(soundHit);
		}
	}
}