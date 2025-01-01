//This script defines the player, its movement, as well as its death
#pragma strict

internal var thisTransform:Transform;
internal var gameController:GameObject;

//How fast the player's jump power increases when we are holding the jump button
var jumpChargeSpeed:float = 30;

//The current jump power of the player
internal var jumpPower:float = 2;

//The maximum jump power of the player
var jumpChargeMax:float = 20;

//Should the player automatically jump when reaching the maximum power?
internal var autoJump:boolean = true;

//A power bar that shows how high the player will jump.
var powerBar:Transform;

//The *horizontal* movement speed of the player when it is jumping
var moveSpeed:float = 4;

//The particle effects that will play when the player jumps and lands on a column
var jumpEffect:ParticleSystem;
var landEffect:ParticleSystem;
var perfectEffect:ParticleSystem;

//Various animations for the player
var animationJumpStart:AnimationClip;
var animationJumpEnd:AnimationClip;
var animationFullPower:AnimationClip;
var animationFalling:AnimationClip;
var animationLanded:AnimationClip;

//Various sounds and their source
var soundStartJump:AudioClip;
var soundEndJump:AudioClip;
var soundLand:AudioClip;
var soundCrash:AudioClip;
var soundPerfect:AudioClip;
var soundSourceTag:String = "GameController";
internal var soundSource:GameObject;

//Did the player start the jump process ( powering up and then releasing )
internal var startJump:boolean = false;

//Is the player jumping now ( is in mid-air )
internal var isJumping:boolean = false;

//Has the player landed on a column?
internal var isLanded:boolean = false;

internal var isFalling:boolean = false;

function Start() 
{
	thisTransform = transform;
	
	//Assign the game controller for easier access
	gameController = GameObject.FindGameObjectWithTag("GameController");
	
	//Set the particle effects to the "RenderInFront" sorting layer so that the effects appear in front of the player object
	if ( jumpEffect )    jumpEffect.GetComponent.<Renderer>().sortingLayerName = "RenderInFront";
	if ( landEffect )    landEffect.GetComponent.<Renderer>().sortingLayerName = "RenderInFront";
	if ( perfectEffect )    perfectEffect.GetComponent.<Renderer>().sortingLayerName = "RenderInFront";

		//Assign the sound source for easier access
	if ( GameObject.FindGameObjectWithTag(soundSourceTag) )    soundSource = GameObject.FindGameObjectWithTag(soundSourceTag);
}

function Update() 
{
	//If we are starting to jump, charge up the jump power as long as we are holding the jump button down
	if ( startJump == true )
	{
		//Charge up the jump power
		if ( jumpPower < jumpChargeMax )
		{
			//Add to the jump power based on charge speed
			jumpPower += Time.deltaTime * jumpChargeSpeed;

			//Update the power bar fill amount
			powerBar.Find("Base/FillAmount").GetComponent(Image).fillAmount = jumpPower/jumpChargeMax;
			
			//Play the charge sound and change the pitch based on the jump power
			if ( soundSource )    soundSource.GetComponent.<AudioSource>().pitch = 0.3f + jumpPower * 0.1f;
		}
		else if ( autoJump == true )
		{
			//If the jump power exceeds the maximum allowed jump power, end charging, and launch the player
			EndJump();
		}
		else
		{
			//Play the full power animation
			if ( GetComponent.<Animation>() && animationFalling )    GetComponent.<Animation>().Play(animationFullPower.name);
		}
	}
	
	//If the player is moving down, then he is falling
	if ( isFalling == false && GetComponent.<Rigidbody2D>().velocity.y < 0 )
	{
		isFalling = true;
		
		//Play the falling animation
		if ( GetComponent.<Animation>() && animationFalling )
		{
			//Play the animation
			GetComponent.<Animation>().PlayQueued(animationFalling.name, QueueMode.CompleteOthers);
		}
	}
	
	//
	//if ( isLanded == false )    rigidbody2D.velocity.x = moveSpeed;
}

//This function adds score to the gamecontroller
function ChangeScore( landedObject:Transform )
{
	gameController.SendMessage("ChangeScore", landedObject);
}

//This function destroys the player, and triggers the game over event
function Die()
{
	//Call the game over function from the game controller
	gameController.SendMessage("GameOver", 0.5);
	
	//Play the death sound
	if ( soundSource )
	{
		soundSource.GetComponent.<AudioSource>().pitch = 1;
		
		//If there is a sound source and a sound assigned, play it from the source
		if ( soundCrash )    soundSource.GetComponent.<AudioSource>().PlayOneShot(soundCrash);
	}
	
	//Remove this object
	Destroy(gameObject);
}

//This function starts the jumping process, allowing the player to charge up the jump power as long as he is holding the jump button down
function StartJump( playerAutoJump:boolean )
{
	//Set the player auto jump state based on the GameController playerAutoJump value
	autoJump = playerAutoJump;
	
	//You can only jump if you are on land
	if ( isLanded == true )
	{	
		startJump = true;
		
		//Reset the jump power
		jumpPower = 0;
		
		//Play the jump start animation ( charging up the jump power )
		if ( GetComponent.<Animation>() && animationJumpStart )
		{
			//Stop the animation
			GetComponent.<Animation>().Stop();
			
			//Play the animation
			GetComponent.<Animation>().Play(animationJumpStart.name);
		}
		
		//Align the power bar to the player and activate it
		if ( powerBar )
		{
			powerBar.position = thisTransform.position;

			powerBar.gameObject.SetActive(true);
		}
		
		if ( soundSource )
		{
			//If there is a sound source and a sound assigned, play it from the source
			if ( soundStartJump )    soundSource.GetComponent.<AudioSource>().PlayOneShot(soundStartJump);
		}
	}
}

//This function ends the jump process, and launches the player with the jump power we charged
function EndJump()
{
	//You can only jump if you are on land, and you already charged up the jump power ( jump start )
	if ( isLanded == true && startJump == true )
	{
		startJump = false;
		isJumping = true;
		isLanded = false;
		isFalling = false;
		
		//Give the physics body velocity based on jump power and move speed
		GetComponent.<Rigidbody2D>().velocity.y = jumpPower;
		GetComponent.<Rigidbody2D>().velocity.x = moveSpeed;
		
		//Play the jump ( launch ) animation
		if ( GetComponent.<Animation>() && animationJumpEnd )
		{
			//Stop the animation
			GetComponent.<Animation>().Stop();
			
			//Play the animation
			GetComponent.<Animation>().Play(animationJumpEnd.name);
		}
		
		//Deactivate the power bar
		if ( powerBar )    powerBar.gameObject.SetActive(false);
		
		//Play the jump particle effect
		if ( jumpEffect )   jumpEffect.Play(); 
		
		//Play the jump sound ( launch )
		if ( soundSource )
		{
			soundSource.GetComponent.<AudioSource>().Stop();
			
			soundSource.GetComponent.<AudioSource>().pitch = 0.6 + jumpPower * 0.05;
			
			//If there is a sound source and a sound assigned, play it from the source
			if ( soundEndJump )    soundSource.GetComponent.<AudioSource>().PlayOneShot(soundEndJump);
		}
		
	}
}

//This function runs when the player succesfully lands on a column
function PlayerLanded()
{
	isLanded = true;
	
	//Play the landing animation
	if ( GetComponent.<Animation>() && animationLanded )
	{
		//Stop the animation
		GetComponent.<Animation>().Stop();
		
		//Play the animation
		GetComponent.<Animation>().Play(animationLanded.name);
	}
	
	//Play the landing particle effect
	if ( landEffect )    landEffect.Play();
	
	//Play the landing sound
	if ( soundSource )
	{
		soundSource.GetComponent.<AudioSource>().pitch = 1;
		
		//If there is a sound source and a sound assigned, play it from the source
		if ( soundLand )    soundSource.GetComponent.<AudioSource>().PlayOneShot(soundLand);
	}
}

//This function runs when the player executes a perfect landing ( closest to the middle )
function PerfectLanding( streak:int )
{
	//Play the perfect landing particle effect
	if ( perfectEffect )    perfectEffect.Play();
	
	//If there is a sound source and a sound assigned, play it from the source
	if ( soundSource && soundPerfect )    soundSource.GetComponent.<AudioSource>().PlayOneShot(soundPerfect);
}

//This function rescales this object over time
function Rescale( targetScale:float )
{
	//Perform the scaling action for 1 second
	var scaleTime:float = 1;
	
	while ( scaleTime > 0 )
	{
		//Count down the scaling time
		scaleTime -= Time.deltaTime;
		
		//Wait for the fixed update so we can animate the scaling
		yield WaitForFixedUpdate();
		
		//Scale the object up or down until we reach the target scale
		thisTransform.localScale.x -= ( thisTransform.localScale.x - targetScale ) * 5 * Time.deltaTime;
		
		thisTransform.localScale = Vector3.one * thisTransform.localScale.x;
	}
	
	//Rescale the object to the target scale instantly, so we make sure that we got the the target
	thisTransform.localScale = Vector3.one * targetScale;
}
