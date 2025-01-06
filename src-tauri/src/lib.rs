use tauri::{menu::Menu, Manager};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let port: u16 = 61234;

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_localhost::Builder::new(port).build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet])
        // .menu(|handle| Menu::with_items(handle, &[]))
        .setup(move |app| {
            #[cfg(not(dev))]
            {
                let url = format!("http://localhost:{}", port).parse().unwrap();
                let mut main_window = app.get_webview_window("main").unwrap();

                main_window.navigate(url)?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
