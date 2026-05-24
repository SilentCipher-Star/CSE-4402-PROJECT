package main;

import javax.swing.JFrame;

public class Main {

	public static void main(String[] args) {
		JFrame window = new JFrame();
		
		// Lets the window close properly when the user clicks on the close button
		window.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);  
		window.setResizable(false);
		window.setTitle("2D Adventure");
		
		Game_panel game_panel = new Game_panel();
		window.add(game_panel);
		window.pack(); //causes the window to fit the preferred size
		//not specifying the location of the window,git remote -v
		//it will be at the center of the screen
		window.setLocationRelativeTo(null);
		window.setVisible(true);
		game_panel.startGameThread();
	}

}
