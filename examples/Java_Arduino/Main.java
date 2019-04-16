package breatherliser;

import java.util.Scanner;
import javax.swing.JFrame;
import javax.swing.JSlider;

import com.fazecast.jSerialComm.*;

import breatherliser.post.pearson;

public class Main {

	public static void main(String[] args) {
		pearson p= new pearson();
		JFrame window = new JFrame();
		JSlider slider = new JSlider();
		slider.setMaximum(500);
		window.add(slider);
		window.pack();
		window.setVisible(true);

		SerialPort[] ports = SerialPort.getCommPorts();
		
		System.out.println("Select a port:");
		
		int i = 1;
		
		for(SerialPort port : ports) {
			System.out.println(i++ +  ": " + port.getSystemPortName());
		}
		
		Scanner s = new Scanner(System.in);
		int chosenPort = s.nextInt();

		SerialPort serialPort = ports[chosenPort - 1];
		
		if(serialPort.openPort()) {
			System.out.println("Port opened successfully.");
		
			//serialPort.setComPortParameters(9600, 8, 1, SerialPort.NO_PARITY);
			serialPort.setComPortTimeouts(SerialPort.TIMEOUT_READ_BLOCKING, 0, 0);

			Scanner data = new Scanner(serialPort.getInputStream());
			int value = 0;
			while(data.hasNextLine()){
				try{value = Integer.parseInt(data.nextLine());}catch(Exception e){}
				slider.setValue(value);
				p.go(value);
			}
			
			serialPort.closePort();
			System.out.println("Done.");
		}else {
			System.out.println("Unable to open the port.");
			return;
		}
		
	}

}