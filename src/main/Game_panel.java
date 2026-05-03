package main;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;

import javax.swing.JPanel;

public class Game_panel extends JPanel implements Runnable{  //has all the function of JPanel since it inherits this
	
	//SCREEN SETTINGS
	final int originalTileSize = 16;  //16X16 tile
	final int scale = 3;
	final int tileSize = originalTileSize * scale; //48X48 tile size
	final int maxScreenCol = 16;
	final int maxScreenRow = 16;
	final int screenWidth = tileSize*maxScreenCol; //760 pixels
	final int screenHeight = tileSize*maxScreenRow; // 576 pixels
	
	int hopCounter = 0;  
	int hopInterval = 15;   // The "pause" duration (approx 1/4 second at 60fps)
	int hopDistance = 40;   // How far the bird jumps in one go
	//FPS
	int fps = 60;
	
	KeyHandler KeyH = new KeyHandler();
	Thread game_thread;
	//set player's default pos
	int playerX = 100;
	int playerY = 100;
	int playerSpeed = 4;
	
	public Game_panel() {
		this.setPreferredSize(new Dimension(screenWidth,screenHeight)); //Sets the size of this class (JPanel)
		this.setBackground(Color.black);
		// if set to true then all the drawing from this component will
		//be done in an offscreen painting buffer
		// in short can improve game's render performance
		this.setDoubleBuffered(true);
		this.addKeyListener(KeyH);
		this.setFocusable(true);
	}

	public void startGameThread() {
		game_thread =  new Thread(this); 
		game_thread.start();
		
	}
	
	@Override
		
	//DELTA
	public void run() {
		double drawInterval = 1000000000 / fps; 
		double delta = 0;
		long lastTime = System.nanoTime();
		long currentTime;
		
		while(game_thread != null) {
			currentTime = System.nanoTime();
			delta += (currentTime - lastTime)/drawInterval;
			lastTime = currentTime;
			if(delta >= 1) {
				update();
				repaint();
				delta--;
			}
		}
	}
	
	public void update() {
    // Only bounce if the timer has cooled down
    	if (hopCounter <= 0) {
        	boolean moved = false;

        // Using separate 'if' statements for diagonal or independent movement
        	if (KeyH.upPressed) {
            	playerY -= hopDistance; // Use hopDistance for bigger jumps
            	moved = true;
        	} 
        	if (KeyH.downPressed) {
            	playerY += hopDistance;
            	moved = true;
        	} 
        	if (KeyH.leftPressed) {
            	playerX -= hopDistance;
            	moved = true;
        	} 
        	if (KeyH.rightPressed) {
            	playerX += hopDistance;
            	moved = true;
        	}

    	    // Reset the rhythmic timer if we moved
    	    if (moved) {
    	        hopCounter = hopInterval; 
    	    }
    	} else {
    	    // Count down every frame (60 times per second)
    	    hopCounter--;
    	}
	}
	
	public void paintComponent(Graphics g) {
    	super.paintComponent(g);
    	Graphics2D g2 = (Graphics2D) g;

    	int w = 48;
    	int h = 48;

    // Visual trick: Squash when landing/waiting, stretch when jumping
    	if (hopCounter > 0) {
    	    h = 35; // Squashed (on the ground waiting)
    	    w = 55;
    	} else {
    	    h = 55; // Stretched (ready to jump)
    	    w = 40;
    	}

    	g2.setColor(Color.WHITE);
    	// Adjust Y so it looks like it's standing on the same "floor"
    	g2.fillRect(playerX, playerY + (48 - h), w, h); 
    	g2.dispose(); // Good practice for Graphics2D
	}
}