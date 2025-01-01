//This script controls the game, starting it, following game progress, and finishing it with game over.
//It also creates columns as the player moves forward, and calculates the bonus the player gets when it lands.
#if UNITY_5_3
import UnityEngine.SceneManagement;
#endif

#pragma strict

//Using the new Unity 4.6 UI
import UnityEngine.UI;

//The player object, and the current player
var playerObjects:Transform[];
var currentPlayer:int = 0;

//The camera that follows the player, and its speed
var cameraObject:Transform;
var cameraSpeed:float = 10;

//A list of background elements that loop
var loopingBackground:LoopingBackground[];

//This class defines the background elements which are animated to loop
public class LoopingBackground
{
	//The object that will loop. This object should have a looping animation
	var backgroundObject:Transform;
	
	//The speed of the animation loop
	var animationSpeed:float = 1;
	
	//The offset of the time of the animation
	var animationOffset:float = 0;
}

//A list of columns that that randomly appear as the player moves forward
var columns:Transform[];

// A list of moving columns that randomly appear as the player moves forward
var movingColumns:Transform[];

// The chance for a moving column to appear
var movingColumnChance:float = 0;

//The range of the horizontal and vertical gap between each two columns
var columnGapRange:Vector2 = Vector2(3,7);
var columnHeightRange:Vector2 = Vector2(-4,0);

//How many columns to create before starting the game
var precreateColumns:int = 5;
var nextColumnPosition:Vector2 = Vector2( 0, -2);

//A list of items that can appear on columns
var items:Transform[];

//After how many columns does an item appear?
var itemRate:int = 8;
internal var itemRateCount:int = 0;

// An array of powerups that can be activated
var powerups:Powerup[];

public class Powerup
{
	// The name of the function 
	var startFunction:String = "SetScoreMultiplier";
	var startParamater:float = 2;
	
	// The duration of this powerup. After it reaches 0, the end functions run
	var duration:float  = 10;
	internal var durationMax:float;

	// The name of the function 
	var endFunction:String = "SetScoreMultiplier";
	var endParamater:float = 1;

	// The icon of this powerup
	var icon:Transform;
}

//The jump button. Hold this button to charge the jump power, then release to launch the player up and forward
var jumpButton:String = "Jump";

//Should the player auto jump when reaching the maximum jump power?
var playerAutoJump:boolean = true;

//A list of scores the player gets based on how far from the center of the column he lands
var landingBonuses:LandingBonus[];

//This class defines the landing distance from the center of a column, and the bonus value it adds to the score
public class LandingBonus
{
	var landDistance:float = 0.5;
	var bonusValue:float = 100;
}

//The streak value is multiplied by the bonus you get when you land closest to the center of a platform.
//Each consecutive perfect landing adds 1x to the streak. The streak is broken when you don't land closest to the center.
internal var currentStreak:int = 0;

//The text object that shows the bonus we got when landing
var bonusText:Transform;

//The score and score text of the player
var score:int = 0;
var scoreText:Transform;
internal var highScore:int = 0;
internal var scoreMultiplier:int = 1;

//The overall game speed
var gameSpeed:float = 1;

// How many points the player needs to collect before leveling up
var levelUpEveryScore:int = 1000;
internal var levelProgress:int = 0;

// The change in column height when leveling up
var columnHeightIncrease:Vector2 = Vector2(-0.2, 0.2);
var columnHeightMax:Vector2 = Vector2(-4, 1);

// Increases the moving column chance when leveling up
var increaseMovingColumnChance:float = 0.05;

//This is vertical (Y) position of the death line. When the player falls below this line, he dies
var deathLineHeight:float = -2;

// The number of continues the player has
var continues:int = 1;

// The last position the player landed on succesfully. This is used to reset the player when continuing after GameOver
internal var lastLandedObject:Transform;

//Various canvases for the UI
var gameCanvas:Transform;
var pauseCanvas:Transform;
var gameOverCanvas:Transform;

//Is the game over?
internal var isGameOver:boolean = false;

//The level of the main menu that can be loaded after the game ends
var mainMenuLevelName:String = "MainMenu";

//Various sounds and their source
var soundLevelUp:AudioClip;
var soundGameOver:AudioClip;
var soundSourceTag:String = "GameController";
internal var soundSource:GameObject;

//The button that will restart the game after game over
var confirmButton:String = "Submit";

//The button that pauses the game. Clicking on the pause button in the UI also pauses the game
var pauseButton:String = "Cancel";
internal var isPaused:boolean = false;

internal var index:int = 0;


function Start()
{
	//Update the score
	UpdateScore();
	
	//Hide the game over canvas
	if ( gameOverCanvas )    gameOverCanvas.gameObject.SetActive(false);
	
	//Get the highscore for the player
	#if UNITY_5_3
	highScore = PlayerPrefs.GetInt(SceneManager.GetActiveScene().name + "HighScore", 0);
	#else
	highScore = PlayerPrefs.GetInt(Application.loadedLevelName + "HighScore", 0);
	#endif
	
	//Get the currently selected player from PlayerPrefs
	currentPlayer = PlayerPrefs.GetInt("CurrentPlayer", currentPlayer);
	
	//Set the current player object
	SetPlayer(currentPlayer);
	
	//If the player object is not already assigned, Assign it from the "Player" tag
	if ( cameraObject == null )    cameraObject = GameObject.FindGameObjectWithTag("MainCamera").transform;
	
	//Set the background animation offset
	for ( index = 0 ; index < loopingBackground.Length ; index++ )
	{
		//Choose a random time from the animation
		//loopingBackground[index].backgroundObject.animation[loopingBackground[index].backgroundObject.animation.clip.name].time = Random.Range(0, loopingBackground[index].backgroundObject.animation.clip.length);
		loopingBackground[index].backgroundObject.GetComponent.<Animation>()[loopingBackground[index].backgroundObject.GetComponent.<Animation>().clip.name].time = loopingBackground[index].animationOffset;

		//Enable the animation
		loopingBackground[index].backgroundObject.GetComponent.<Animation>()[loopingBackground[index].backgroundObject.GetComponent.<Animation>().clip.name].enabled = true;
		
		//Sample the animation at the current time
		loopingBackground[index].backgroundObject.GetComponent.<Animation>().Sample();
		
		//Disable the animation
		loopingBackground[index].backgroundObject.GetComponent.<Animation>()[loopingBackground[index].backgroundObject.GetComponent.<Animation>().clip.name].enabled = false;
		
		//Play the animation from the new time we sampled
		loopingBackground[index].backgroundObject.GetComponent.<Animation>().Play();
	}
	
	//Create a few columns at the start of the game
	createColumn(1, false);
	createColumn(precreateColumns, true);
	
	//Go through all the powerups and reset their timers
	for ( index = 0 ; index < powerups.Length ; index++ )
	{
		//Set the maximum duration of the powerup
		powerups[index].durationMax = powerups[index].duration;
		
		//Reset the duration counter
		powerups[index].duration = 0;
		
		//Deactivate the icon of the powerup
		powerups[index].icon.gameObject.SetActive(false);
	}
	
	//Assign the sound source for easier access
	if ( GameObject.FindGameObjectWithTag(soundSourceTag) )    soundSource = GameObject.FindGameObjectWithTag(soundSourceTag);
	
	//Pause the game at the start
	Pause();
}

function Update() 
{
	//If the game is over, listen for the Restart and MainMenu buttons
	if ( isGameOver == true )
	{
		//The jump button restarts the game
		if ( Input.GetButtonDown(confirmButton) )
		{
			Restart();
		}
		
		//The pause button goes to the main menu
		if ( Input.GetButtonDown(pauseButton) )
		{
			MainMenu();
		}
	}
	else
	{
		//Toggle pause/unpause in the game
		if ( Input.GetButtonDown(pauseButton) )
		{
			if ( isPaused == true )    Unpause();
			else    Pause();
		}
		
		//If there is a player object, you can make it jump, the background moves in a loop.
		if ( playerObjects[currentPlayer] )
		{
			if ( cameraObject )
			{
				//Make the camera chase the player in all directions
				cameraObject.GetComponent.<Rigidbody2D>().velocity.x = (playerObjects[currentPlayer].position.x - cameraObject.position.x) * cameraSpeed;
			}
			
			//If we press the jump buttons, start the jump sequence, charging up the jump power
			if ( Input.GetButtonDown(jumpButton) )    StartJump();
			
			//If we release the jump buttons, end the jump sequence, and make the player jump
			if ( Input.GetButtonUp(jumpButton) )    EndJump();
			
			//If the player object moves below the death line, kill it.
			if ( playerObjects[currentPlayer].position.y < deathLineHeight )     playerObjects[currentPlayer].SendMessage("Die");
		}
	}
	
	//Set the speed of the looping background based on the horizontal speed of the player
	for ( index = 0 ; index < loopingBackground.Length ; index++ )
	{
		loopingBackground[index].backgroundObject.GetComponent.<Animation>()[loopingBackground[index].backgroundObject.GetComponent.<Animation>().clip.name].speed = loopingBackground[index].animationSpeed * cameraObject.GetComponent.<Rigidbody2D>().velocity.x;
	}
	
	//If the camera moved forward enough, create another column
	if ( nextColumnPosition.x - cameraObject.position.x < precreateColumns * 5 )
	{ 
		createColumn(1, true);
	}
}

//This function creates a column
function createColumn( columnCount:int, giveBonus:boolean )
{
	//Create a few columns at the start of the game
	while ( columnCount > 0 )
	{
		columnCount--;
		
		//Choose a random column from the list
		var randomColumn:int = 0;
		
		//Create a random column from the list of available columns
		var newColumn:Transform;
		
		// There's a chance for a moving column to appear
		if ( Random.value < movingColumnChance )
		{
			//Choose a random column from the list
			randomColumn = Mathf.Floor(Random.Range(0, movingColumns.Length));
			
			//Create a random column from the list of available moving columns
			newColumn = Instantiate( movingColumns[randomColumn], nextColumnPosition, Quaternion.identity);
		}
		else
		{
			//Choose a random column from the list
			randomColumn = Mathf.Floor(Random.Range(0, columns.Length));
			
			//Create a random column from the list of available columns
			newColumn = Instantiate( columns[randomColumn], nextColumnPosition, Quaternion.identity);
		}
		
		//Go to the next column position, based on the gap of the current column
		nextColumnPosition.x += Random.Range(columnGapRange.x, columnGapRange.y);
		nextColumnPosition.y = Random.Range(columnHeightRange.x, columnHeightRange.y);
		
		// If the column is moving, give it a vertical range
		newColumn.SendMessage("SetMoveRange", Vector2( columnHeightRange.x, columnHeightRange.y));
		
		//Should this column give bonus when landed upon?
		if ( giveBonus == false )    newColumn.SendMessage("NoBonus");
		
		//Count the rate for an item to appear on a column
		itemRateCount++;
		
		//Create a new item on the column
		if ( itemRateCount >= itemRate  )
		{
			//Create a new random item from the list of items
			var newItem = Instantiate( items[Mathf.Floor(Random.Range(0, items.Length))], newColumn.position, Quaternion.identity);
			
			//Reset the item rate counter
			itemRateCount = 0;
		}
	}
}

//This function changes the score of the player
function ChangeScore( landedObject:Transform )
{
	//Calculate the distance of the player from the center of the column when it landed on it
	var landingDistance = Mathf.Abs(landedObject.position.x - playerObjects[currentPlayer].position.x);
	
	//Has bonus been given yet? If so, don't give any more bonus
	var bonusGiven:boolean = false;
	
	//Go through all landing bonuses, and check which one should be given to the player
	for ( index = 0 ; index < landingBonuses.Length ; index++ )
	{
		//If no bonus has been given, check if the player is within the correct distance to get a bonus
		if ( bonusGiven == false && landingDistance <= landingBonuses[index].landDistance )    
		{
			//Increase the streak if we are closest to the center, or reset it if we're not
			if ( index == 0 )    
			{
				currentStreak++;
				
				//Add the bonus to the score
				score += landingBonuses[index].bonusValue * currentStreak * scoreMultiplier;
				
				// Increase level progress
				levelProgress += landingBonuses[index].bonusValue * currentStreak * scoreMultiplier;
				
				//Call the perfect landing function, which plays a sound and particle effect based on the player's streak
				playerObjects[currentPlayer].gameObject.SendMessage("PerfectLanding", currentStreak);
			}
			else    
			{
				currentStreak = 0;
				
				//Add the bonus to the score
				score += landingBonuses[index].bonusValue * scoreMultiplier;
				
				// Increase level progress
				levelProgress += landingBonuses[index].bonusValue * scoreMultiplier;
			}
			
			//Update the bonus text
			if ( bonusText )    
			{
				//Set the position of the bonus text to the player
				bonusText.position = playerObjects[currentPlayer].position;
				
				//Play the bonus animation
				if ( bonusText.GetComponent.<Animation>() )    bonusText.GetComponent.<Animation>().Play();
				
				//Update the text of the bonus object. If we have a streak, display 2X 3X etc
				if ( currentStreak > 1 )    bonusText.Find("Text").GetComponent(Text).text = "+" + (landingBonuses[index].bonusValue * currentStreak * scoreMultiplier).ToString() + " " + currentStreak.ToString() + "X";  
				else    bonusText.Find("Text").GetComponent(Text).text = "+" + (landingBonuses[index].bonusValue * scoreMultiplier).ToString();
			}
			
			//The score has been given, no need to give any more bonus
			bonusGiven = true;
		}
	}
	
	//Update the score
	UpdateScore();
}

//This function updates the player's score, ( and in a later update checks if we reached the required score to level up )
function UpdateScore()
{
	//Update the score text
	if ( scoreText )    scoreText.GetComponent(Text).text = score.ToString();
	
	//If we reached the required number of points, level up!
	if ( levelProgress >= levelUpEveryScore )
	{
		levelProgress -= levelUpEveryScore;
		
		LevelUp();
	}
}

//This function levels up, and increases the difficulty of the game
function LevelUp()
{
	// Increase the height range of the columns
	columnHeightRange += columnHeightIncrease;
	
	// Limit the height range of columns
	if ( columnHeightRange.x < columnHeightMax.x )    columnHeightRange.x = columnHeightMax.x;
	if ( columnHeightRange.y > columnHeightMax.y )    columnHeightRange.y = columnHeightMax.y;
	
	// Increase the chance of a moving column appearing
	movingColumnChance += increaseMovingColumnChance;
	
	// If there is a source and a sound, play it from the source
	if ( soundSource && soundLevelUp )    soundSource.GetComponent.<AudioSource>().PlayOneShot(soundLevelUp);
}

//This function sets the score multiplier ( When the player picks up coins he gets 1X,2X,etc score )
function SetScoreMultiplier( setValue:int )
{
	// Set the score multiplier
	scoreMultiplier = setValue;
}

//This function pauses the game
function Pause()
{
	isPaused = true;
	
	//Set timescale to 0, preventing anything from moving
	Time.timeScale = 0;
	
	//Show the pause screen and hide the game screen
	if ( pauseCanvas )    pauseCanvas.gameObject.SetActive(true);
	if ( gameCanvas )    gameCanvas.gameObject.SetActive(false);
}

//This function resume the game
function Unpause()
{
	isPaused = false;
	
	//Set timescale back to the current game speed
	Time.timeScale = gameSpeed;
	
	//Hide the pause screen and show the game screen
	if ( pauseCanvas )    pauseCanvas.gameObject.SetActive(false);
	if ( gameCanvas )    gameCanvas.gameObject.SetActive(true);
}

//This function handles the game over event
function GameOver( delay:float )
{
	//Go through all the powerups and nullify their timers, making them end
	for ( index = 0 ; index < powerups.Length ; index++ )
	{
		//Set the duration of the powerup to 0
		powerups[index].duration = 0;
	}
	
	yield WaitForSeconds(delay);
	
	//If there is a source and a sound, play it from the source
	if ( soundSource && soundGameOver )    soundSource.GetComponent.<AudioSource>().PlayOneShot(soundGameOver);
	
	isGameOver = true;
	
	//Remove the pause and game screens
	if ( pauseCanvas )    Destroy(pauseCanvas.gameObject);
	if ( gameCanvas )    Destroy(gameCanvas.gameObject);
	
	//Show the game over screen
	if ( gameOverCanvas )    
	{
		//Show the game over screen
		gameOverCanvas.gameObject.SetActive(true);
		
		//Write the score text
		gameOverCanvas.Find("TextScore").GetComponent(Text).text = "SCORE " + score.ToString();
		
		//Check if we got a high score
		if ( score > highScore )    
		{
			highScore = score;
			
			//Register the new high score
			#if UNITY_5_3
			PlayerPrefs.SetInt(SceneManager.GetActiveScene().name + "HighScore", score);
			#else
			PlayerPrefs.SetInt(Application.loadedLevelName + "HighScore", score);
			#endif
		}
		
		//Write the high sscore text
		gameOverCanvas.Find("TextHighScore").GetComponent(Text).text = "HIGH SCORE " + highScore.ToString();
	}
}

//This function restarts the current level
function Restart()
{
	#if UNITY_5_3
	SceneManager.LoadScene(SceneManager.GetActiveScene().name);
	#else
	Application.LoadLevel(Application.loadedLevelName);
	#endif
}

//This function returns to the Main Menu
function MainMenu()
{
	#if UNITY_5_3
	SceneManager.LoadScene(mainMenuLevelName);
	#else
	Application.LoadLevel(mainMenuLevelName);
	#endif
}

//This function continues the game from your last point
function Continue()
{
	if ( continues > 0 )
	{
		// Reset the player to its last position
		playerObjects[currentPlayer].position = lastLandedObject.position;

		// Reset the player's dead status
		playerObjects[currentPlayer].SendMessage("NotDead");

		// Continue the game
		isGameOver = false;
		
		// Show the game screen and hide the game over screen
		if ( gameCanvas )    gameCanvas.gameObject.SetActive(true);
		if ( gameOverCanvas )    gameOverCanvas.gameObject.SetActive(false);

		ChangeContinues(-1);
	}
}

// This function changes the number of continues we have
function ChangeContinues( changeValue:int )
{
	continues += changeValue;

	// Limit the minimum number of continues to 0
	if ( continues > 0 ) 
	{
		// Deactivate the continues object if we have no more continues
		if ( gameOverCanvas )    gameOverCanvas.Find("ButtonContinue").gameObject.SetActive(true);
	}
	else
	{
		// Activate the continues object if we have no more continues
		if ( gameOverCanvas )    gameOverCanvas.Find("ButtonContinue").gameObject.SetActive(false);
	}
}

//This function activates the selected player, while deactivating all the others
function SetPlayer( playerNumber:int )
{
	//Go through all the players, and hide each one except the current player
	for(index = 0; index < playerObjects.Length; index++)
	{
		if ( index != playerNumber )    playerObjects[index].gameObject.SetActive(false);
		else    playerObjects[index].gameObject.SetActive(true);
	}
}

//This function sends a start jump command to the current player
function StartJump()
{
	if ( playerObjects[currentPlayer] )    playerObjects[currentPlayer].SendMessage("StartJump", playerAutoJump);
}

//This function sends an end jump command to the current player
function EndJump()
{
	if ( playerObjects[currentPlayer] )    playerObjects[currentPlayer].SendMessage("EndJump");
}

//This function sends a rescale command to the player
function RescalePlayer( targetScale:float )
{
	if ( playerObjects[currentPlayer] )    playerObjects[currentPlayer].SendMessage("Rescale", targetScale);
}

//This function activates a power up from a list of available power ups
function ActivatePowerup( powerupIndex:int )
{
	//If there is already a similar powerup running, refill its duration timer
	if ( powerups[powerupIndex].duration > 0 )
	{
		//Refil the duration of the powerup to maximum
		powerups[powerupIndex].duration = powerups[powerupIndex].durationMax;
	}
	else //Otherwise, activate the power up functions
	{
		//Activate the powerup icon
		powerups[powerupIndex].icon.gameObject.SetActive(true);

		//Run up to two start functions from the gamecontroller
		if ( powerups[powerupIndex].startFunction != String.Empty )    SendMessage(powerups[powerupIndex].startFunction, powerups[powerupIndex].startParamater);

		//Fill the duration timer to maximum
		powerups[powerupIndex].duration = powerups[powerupIndex].durationMax;
		
		//Count down the duration of the powerup
		while ( powerups[powerupIndex].duration > 0 )
		{
			yield WaitForSeconds(Time.deltaTime);

			powerups[powerupIndex].duration -= Time.deltaTime;

			//Animate the powerup timer graphic using fill amount
			powerups[powerupIndex].icon.Find("FillAmount").GetComponent(Image).fillAmount = powerups[powerupIndex].duration/powerups[powerupIndex].durationMax;
		}

		//Run up to two end functions from the gamecontroller
		if ( powerups[powerupIndex].endFunction != String.Empty )    SendMessage(powerups[powerupIndex].endFunction, powerups[powerupIndex].endParamater);

		//Deactivate the powerup icon
		powerups[powerupIndex].icon.gameObject.SetActive(false);
	}
}

function OnDrawGizmos()
{
	Gizmos.color = Color.red;
	
	//Draw the position of the next column
	Gizmos.DrawSphere( nextColumnPosition,0.2);
	
	//Draw the death line. Falling off it will kill the player
	Gizmos.DrawLine( Vector3(-10,deathLineHeight,0), Vector3(10,deathLineHeight,0));
}