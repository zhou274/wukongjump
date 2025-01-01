//This script executes a function on a target object. It needs to be attached to a UI Button.

#pragma strict

// The tag of the object in which the function will run
var targetTag:String = "GameController";

//The object in which the function will run
internal var targetObject:GameObject;

//The name of the function that will be executed OnMouseDown
var mouseDownFunction:String = "StartJump";

//The name of the function that will be executed OnMouseUp
var mouseUpFunction:String = "EndJump";

// Start this instance.
function Start()
{
	// If the target object is not assigned, assign it by the tag
	if ( targetObject == null )    targetObject = GameObject.FindGameObjectWithTag(targetTag);
}

// Executes the function at the target object, OnMouseDown
function ExecuteMouseDown()
{
	// Check if we have a function name
	if ( mouseDownFunction != String.Empty )
	{  
		// Check if there is a target object
		if ( targetObject )    
		{
			//Send the message to the target object, with a parameter
			targetObject.SendMessage(mouseDownFunction);
		}
	}
}

// Executes the function at the target object, OnMouseUp
function ExecuteMouseUp()
{
	// Check if we have a function name
	if ( mouseUpFunction != String.Empty )
	{  
		// Check if there is a target object
		if ( targetObject )    
		{
			//Send the message to the target object, with a parameter
			targetObject.SendMessage(mouseUpFunction);
		}
	}
}