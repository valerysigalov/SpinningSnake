//
//
//  NativeAudioAssetComplex.java
//
//  Created by Sidney Bofah on 2014-06-26.
//

package com.rjfun.cordova.plugin.nativeaudio;

import java.io.IOException;
import java.util.concurrent.Callable;

import android.content.res.AssetFileDescriptor;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnPreparedListener;
import android.media.MediaPlayer.OnSeekCompleteListener;
import android.util.Log;

public class NativeAudioAssetComplex implements OnPreparedListener, OnCompletionListener, OnSeekCompleteListener {

	private static final int INVALID = 0;
	private static final int PREPARED = 1;
	private static final int PENDING_PLAY = 2;
	private static final int PLAYING = 3;
	private static final int PENDING_LOOP = 4;
	private static final int LOOPING = 5;
	private static final int PENDING_SEEK = 6;
	private static final String LOGTAG = "NativeAudioComplex";
	
	private MediaPlayer mp;
	private int state;
    Callable<Void> completeCallback;

	public NativeAudioAssetComplex( AssetFileDescriptor afd, float volume)  throws IOException
	{
		state = INVALID;
		mp = new MediaPlayer();
        mp.setOnCompletionListener(this);
        mp.setOnPreparedListener(this);
        mp.setOnSeekCompleteListener(this);
		mp.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
		mp.setAudioStreamType(AudioManager.STREAM_MUSIC); 
		mp.setVolume(volume, volume);
		mp.prepare();
	}
	
	public void play(Callable<Void> completeCb) throws IOException
	{
        completeCallback = completeCb;
		invokePlay( false );
	}
	
	private void invokePlay( Boolean loop )
	{
		Boolean playing = ( mp.isLooping() || mp.isPlaying() );
		if ( playing )
		{
			mp.pause();
		}

		int old_state = state;
		state = (loop ? PENDING_LOOP : PENDING_PLAY);
		if (old_state == PREPARED)
		{
			onSeekComplete(mp);
		}
		else if (old_state == PENDING_SEEK)
		{
			//Log.d(LOGTAG, "Waiting for seek to be completed");
		}
		else
		{
			//Log.d(LOGTAG, "Call seek before play");
			mp.seekTo(0);
		}
	}

	public boolean pause()
	{
		try
		{
    		if ( mp.isLooping() || mp.isPlaying() )
			{
				mp.pause();
				return true;
			}
        }
		catch (IllegalStateException e)
		{
		// I don't know why this gets thrown; catch here to save app
		}
		return false;
	}

	public void resume()
	{
		mp.start();
	}

    public void stop()
	{
		try
		{
			if ( mp.isLooping() || mp.isPlaying() )
			{
				mp.pause();
				state = PENDING_SEEK;
				//Log.d(LOGTAG, "Call seek after stop");
				mp.seekTo(0);
           	}
		}
        catch (IllegalStateException e)
        {
           	// I don't know why this gets thrown; catch here to save app
	    }
	}

	public void setVolume(float volume) 
	{
	    try
	    {
			mp.setVolume(volume,volume);
        }
        catch (IllegalStateException e) 
		{
            // I don't know why this gets thrown; catch here to save app
		}
	}
	
	public void loop() throws IOException
	{
		invokePlay( true );
	}
	
	public void unload() throws IOException
	{
		this.stop();
		mp.release();
	}
	
	public void onPrepared(MediaPlayer mPlayer) 
	{
		state = PENDING_SEEK;
		//Log.d(LOGTAG, "Prepared completed, call seek");
		mp.seekTo(0);
	}
	
	public void onSeekComplete(MediaPlayer mPlayer)
	{		
		if (state == PENDING_PLAY) 
		{
			mp.setLooping(false);
			//Log.d(LOGTAG, "Seek complete - play");
			mp.start();
			state = PLAYING;
		}
		else if (state == PENDING_LOOP)
		{
			mp.setLooping(true);
			//Log.d(LOGTAG, "Seek complete - loop");
			mp.start();
			state = LOOPING;
		}
		else if (state == PENDING_SEEK)
		{
			//Log.d(LOGTAG, "Seek complete - prepared");
			state = PREPARED;
		}
		else
		{
			//Log.d(LOGTAG, "Seek complete - do nothing");
		}
	}

	public void onCompletion(MediaPlayer mPlayer)
	{
		if (state != LOOPING)
		{
			try 
			{
				this.state = PENDING_SEEK;
				//Log.d(LOGTAG, "Playback completed, call seek");
				mp.seekTo(0);
                completeCallback.call();
			}
			catch (Exception e)
			{
				e.printStackTrace();
			}
		}
	}
}
