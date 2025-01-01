//This script defines a column, and detects when the player lands on it or launches from it.
#pragma strict

internal var thisTransform:Transform;

//Should this column give a bonus when landed on?
internal var giveBonus:boolean = true;

// Make this column move within a limited range
var movingColumn:boolean = false;

// The starting position of a moving column
internal var startingHeight:float;

// The range in which the column moves
internal var moveRange:Vector2;

// The vertical movement speed of the column
var moveSpeed:float = 1;

function Start()
{
	thisTransform = transform;

	// Choose a random starting height for the moving column
	startingHeight = Random.Range(-1.0f,1.0f);
}

function Update()
{
	if ( movingColumn )
	{
		// Move the column
		thisTransform.position.y = moveRange.x + (moveRange.y - moveRange.x)/2 + Mathf.Sin(moveSpeed * Time.time + startingHeight) * ((moveRange.y - moveRange.x)/2);
	}
}

//Detect when the player lands on this column
function OnCollisionEnter2D(coll: Collision2D) 
{
	//If the player lands on top of this column, and the column hasn't been landed on yet, you can land on it
	if ( coll.gameObject.tag == "Player" && coll.transform.position.y > transform.position.y )    
	{
		//The player has landed
		coll.gameObject.SendMessage("PlayerLanded");
		
		//Give a bonus to the player
		if ( giveBonus == true )    coll.gameObject.SendMessage("ChangeScore", transform);
		
		giveBonus = false;
		
		// Attach the player to this column
		coll.transform.parent = thisTransform;
	}
}

//Don't give bonus when landing on this column
function NoBonus()
{
	giveBonus = false;
}

/// Sets the vertical move range of the column
function SetMoveRange( newMoveRange:Vector2 )
{
	moveRange = newMoveRange;
}