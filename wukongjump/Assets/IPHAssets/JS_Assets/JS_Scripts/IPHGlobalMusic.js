//This script handles a global music source which carries over from scene to scene without resetting the music track.
//You can have this script attached to a music object and include that object in each scene, and the script will keep
//Only the oldest music source in the scene 
#pragma strict

//The tag of the music source
var musicTag:String = "Music";

//The time this instance of the music source has been in the game
internal var instanceTime:float = 0;

function Awake()
{
	//Find all the music objects in the scene
	var musicObjects = GameObject.FindGameObjectsWithTag(musicTag);
	
	//Keep only the music object which has been in the game for more than 0 seconds
	if ( musicObjects.Length > 1 )
	{
		for ( var musicObject in musicObjects )
		{
			if ( musicObject.GetComponent(IPHGlobalMusic).instanceTime <= 0 )    Destroy(gameObject);
		}
	}
}

function Start() 
{
	//Don't destroy this object when loading a new scene
	DontDestroyOnLoad(transform.gameObject);
}
