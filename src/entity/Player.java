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
	public boolean isMoving = false;
	public int pixelCounter = 0;
	public int hopInterval = 15;   // The "pause" duration (approx 1/4 second at 60fps)
	public int hopDistance;   // How far the bird jumps in one go

	public final int screenX;
	public final int screenY;
	
	public Player(Game_panel gp, KeyHandler keyH) {
		this.gp = gp;
		this.keyH = keyH;
		
		screenX = gp.screenWidth/2 - (gp.tileSize/2);
        screenY = gp.screenHeight/2 - (gp.tileSize/2);

        // Create the hitbox
		solidArea = new Rectangle();

		// Push the hitbox 8 pixels inward from the left/right, and 16 pixels down from the top
		solidArea.x = 8;
		solidArea.y = 8;

		// Shrink the actual size of the box (Assuming a 48x48 tile, this makes the box 32x32)
		solidArea.width = 32;
		solidArea.height = 32;

		// Save these default starting positions for the collision checker to use
		solidAreaDefaultX = solidArea.x;
		solidAreaDefaultY = solidArea.y;
		setDefaultValues();
		getPlayerImage();
	}
	
	public void setDefaultValues() {
		worldX = gp.tileSize * 23; 
    	worldY = gp.tileSize * 21;
		hopDistance = gp.tileSize;
		speed = 4;
		direction = "down";
	}
	
	public void getPlayerImage() {
        try {
        // Ensure path starts with / and matches capitals in sidebar
            up1 = ImageIO.read(getClass().getResourceAsStream("/player/Angry_bird_back.png"));
            up2 = up1;
        
            down1 = ImageIO.read(getClass().getResourceAsStream("/player/Angry_bird_right.png"));
            down2 = down1;
        
            right1 = ImageIO.read(getClass().getResourceAsStream("/player/Angry_bird_right.png"));
            right2 = right1;
        
            left1 = ImageIO.read(getClass().getResourceAsStream("/player/Angry_bird_left.png"));
            left2 = left1;
        
        } catch(IOException e) {
            e.printStackTrace();
        }
    }
	
	
	
	public void update() {
    	// 1. Early exit: If the timer is still cooling down, just tick it down and stop.
    	if (hopCounter > 0) {
        	hopCounter--;
        	return; 
    	}

    	// 2. Check if ANY key is currently being pressed
    	if (keyH.upPressed || keyH.downPressed || keyH.leftPressed || keyH.rightPressed) {
        
        	// 3. Set the direction for the sprite and collision checker
        	if (keyH.upPressed) {
         	   direction = "up";
        	} else if (keyH.downPressed) {
        	    direction = "down";
        	} else if (keyH.leftPressed) {
        	    direction = "left";
        	} else if (keyH.rightPressed) {
        	    direction = "right";
        	}

        	// 4. Check for a collision BEFORE applying any movement math
        	collisionOn = false;
        	gp.cChecker.checkTile(this);
			System.out.println("Direction: " + direction + " | Collision: " + collisionOn);

        	// 5. Only apply the hop distance if the path is actually clear
        	if (!collisionOn) {
            	switch (direction) {
                	case "up":
                	    worldY -= hopDistance;
                	    break;
                	case "down":
                	    worldY += hopDistance;
                	    break;
                	case "left":
                	    worldX -= hopDistance;
                	    break;
                	case "right":
                    	worldX += hopDistance;
                	    break;
            	}
        	}

        	// 6. Reset the rhythmic timer since a move was attempted
        	hopCounter = hopInterval; 
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
