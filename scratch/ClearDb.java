import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class ClearDb {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/secauth?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String user = "root";
        String pass = "Mathesh@2007";
        
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {
            
            stmt.executeUpdate("DELETE FROM users");
            System.out.println("SUCCESS: All users have been deleted from the database.");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
