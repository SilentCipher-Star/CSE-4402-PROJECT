package entity;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.io.IOException;

import javax.imageio.ImageIO;

import main.Game_panel;
import main.KeyHandler;

public class Player extends Entity{
	Game_panel gp;
	KeyHandler keyH;
	//FPS
	public int hopCounter = 0;  
	public int hopInterval = 15;   // The "pause" duration (approx 1/4 second at 60fps)
	public int hopDistance = 40;   // How far the bird jumps in one go

	public final int screenX;
	public final int screenY;
	
	public Player(Game_panel gp, KeyHandler keyH) {
		this.gp = gp;
		this.keyH = keyH;
		
		screenX = gp.screenWidth/2 - (gp.tileSize/2);
        screenY = gp.screenHeight/2 - (gp.tileSize/2);

        solidArea = new Rectangle(8, 16, 32, 32);
		
		setDefaultValues();
		getPlayerImage();
	}
	
	public void setDefaultValues() {
		worldX = gp.tileSize * 23 -(gp.tileSize/2);
		worldY =  gp.tileSize * 21 -(gp.tileSize/2);
		speed = 4;
		direction = "down";
	}
	
	public void getPlayerImage() {
        try {
        // Ensure path starts with / and matches capitals in sidebar
            up1 = ImageIO.read(getClass().getResourceAsStream("/player/Angry_Bird_back.png"));
            up2 = up1;
        
            down1 = ImageIO.read(getClass().getResourceAsStream("/player/Angry_Bird_right.png"));
            down2 = down1;
        
            right1 = ImageIO.read(getClass().getResourceAsStream("/player/Angry_Bird_right.png"));
            right2 = right1;
        
            left1 = ImageIO.read(getClass().getResourceAsStream("/player/Angry_Bird_left.png"));
            left2 = left1;
        
        } catch(IOException e) {
            e.printStackTrace();
        }
    }
	
	
	public void update() {
    // Only bounce if the timer has cooled down
    	if (hopCounter <= 0) {
        	boolean moved = false;

        // Using separate 'if' statements for diagonal or independent movement
        	if (keyH.upPressed) {
                direction = "up"; // Set direction for the sprite
            	worldY -= hopDistance; // Use hopDistance for bigger jumps
            	moved = true;
        	} 
        	if (keyH.downPressed) {
                direction = "down";
                worldY += hopDistance;
                moved = true;
            }
        	if (keyH.leftPressed) {
            	direction = "left";
                worldX -= hopDistance;
                moved = true;
        	} 
        	if (keyH.rightPressed) {
            	direction = "right";
                worldX += hopDistance;
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
    
	public void draw(Graphics2D q2, int width, int height) {
        BufferedImage image = null;

        switch(direction) {
            case "up":    image = up1;    break;
            case "down":  image = down1;  break;
            case "left":  image = left1;  break;
            case "right": image = right1; break;
        }

        // Draw the image using the squash/stretch width and height from Game_panel
        q2.drawImage(image, screenX, screenY, width, height, null);
    }
}
