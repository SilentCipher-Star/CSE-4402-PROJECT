package main;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;

import javax.swing.JPanel;

import entity.Player;
import tile.TileManager;
public class Game_panel extends JPanel implements Runnable{  //has all the function of JPanel since it inherits this
	
	//SCREEN SETTINGS
	final int originalTileSize = 16;  //16X16 tile
	final int scale = 3;
	public final int tileSize = originalTileSize * scale; //48X48 tile size
	final int maxScreenCol = 16;
	final int maxScreenRow = 16;
	public final int screenWidth = tileSize*maxScreenCol; //760 pixels
	public final int screenHeight = tileSize*maxScreenRow; // 576 pixels
	//WORLD SETTING
	
	public final int maxWorldCol = 50;
	public final int maxWorldRow = 50;
	public final int worldWidth = tileSize*maxWorldCol;
	public final int worldHeight =  tileSize*maxWorldRow;
	
	public int hopCounter = 0;  
	//FPS
	int fps = 60;
	
	KeyHandler KeyH = new KeyHandler();
	Thread game_thread;
	TileManager tileM = new TileManager(this);
	
	public Player player = new Player(this,KeyH);

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
			player.update();
	}
	public void paintComponent(Graphics g) {
		super.paintComponent(g);
		Graphics2D q2 = (Graphics2D)g;

		int w = tileSize;
    	int h = tileSize;

		if (player.hopCounter > (player.hopInterval / 2)) {
    	    h = tileSize - 10; // Squashed
    	    w = tileSize + 10;
    	} else if (player.hopCounter > 0) {
    	    h = tileSize + 10; // Stretched
    	    w = tileSize - 5;
    	}
		tileM.draw(q2);
		 
		player.draw(q2, w, h);
		q2.dispose();
	}
}