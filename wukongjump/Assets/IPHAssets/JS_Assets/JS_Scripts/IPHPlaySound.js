//This script plays a random sound from a list of sounds, through an audio source
#pragma strict

//A list of possible sounds
var audioList:AudioClip[];

//The tag of the sound source
var audioSourceTag:String = "GameController";

var playOnStart:boolean = true;

function Start() 
{
	if ( playOnStart == true )    PlaySound();
}

function PlaySound()
{
	//If there is a sound source tag and audio to play, play the sound from the audio source based on its tag
	if ( audioSourceTag != "" && audioList.Length > 0 )    GameObject.FindGameObjectWithTag(audioSourceTag).GetComponent.<AudioSource>().PlayOneShot(audioList[Mathf.Floor(Random.value * audioList.Length)]);
}

function PlaySound( soundIndex:int )
{
	//If there is a sound source tag and audio to play, play the sound from the audio source based on its tag
	if ( audioSourceTag != "" && audioList.Length > 0 )    GameObject.FindGameObjectWithTag(audioSourceTag).GetComponent.<AudioSource>().PlayOneShot(audioList[soundIndex]);
}
