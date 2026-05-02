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
	
	//SLEEP
	/*public void run() {
		
		double drawInterval = 1000000000 / fps; // 0.01666 seconds
		double nextDrawTime =  System.nanoTime() + drawInterval;
		
		while(game_thread != null) {
			
			update();
			repaint();
			
			try {
				double remainigTime = nextDrawTime - System.nanoTime();
				remainigTime = remainigTime/1000000;
				
				if(remainigTime < 0) {
					remainigTime = 0;
				}
				
				Thread.sleep((long) remainigTime);
				nextDrawTime += drawInterval;
			}
			catch(InterruptedException e) {
				e.printStackTrace();
			}
		}
	}
	*/
	
	
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
		if(KeyH.upPressed == true) {
			playerY -=playerSpeed;
		}
		else if(KeyH.downPressed == true) {
			playerY +=playerSpeed;			
		}
		else if(KeyH.leftPressed == true) {
			playerX -=playerSpeed;			
		}
		else if(KeyH.rightPressed == true) {
			playerX +=playerSpeed;			
		}
	}
	
	public void paintComponent(Graphics g) {
		super.paintComponent(g);
		Graphics2D q2 = (Graphics2D)g;
		
		q2.setColor(Color.white);
		q2.fillRect(playerX, playerY, tileSize, tileSize);
		q2.dispose();
	}
	
}
