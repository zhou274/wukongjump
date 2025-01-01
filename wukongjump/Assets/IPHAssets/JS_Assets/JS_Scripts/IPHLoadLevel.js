//This script includes functions for loading levels and URLs. It's intended for use with UI Buttons
#if UNITY_5_3
import UnityEngine.SceneManagement;
#endif

#pragma strict

//Load a URL
function LoadURL( urlName:String )
{
	Application.OpenURL(urlName);
}

//Load a level from the scene hierarchy
function LoadLevel( levelName:String )
{
	Time.timeScale = 1;
	
	#if UNITY_5_3
	SceneManager.LoadScene(levelName);
	#else
	Application.LoadLevel(levelName);
	#endif
}

//This function restarts the currently played level
function RestartLevel()
{
	#if UNITY_5_3
	SceneManager.LoadScene(SceneManager.GetActiveScene().name);
	#else
	Application.LoadLevel(Application.loadedLevelName);
	#endif
}
