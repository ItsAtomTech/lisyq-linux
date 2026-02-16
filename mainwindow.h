#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QKeyEvent> // Needed for QKeyEvent
class QWebEngineView;  // Forward declaration
#include <QFileDialog>

QT_BEGIN_NAMESPACE
namespace Ui {
class MainWindow;
}
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

protected:
    void keyPressEvent(QKeyEvent *event);


private slots:
    void on_actionOpen_triggered();



private:
    Ui::MainWindow *ui;
    QWebEngineView *devTools; // Make devTools a member so it doesn’t go out of scope

    QWebEngineView *webView;


    // ================
    // File Management Vars Section
    // ================
    QString SavePath;
    bool FromOpenFile;
    bool asNew;


    void openLSYSFile();


    // ================
    // File Management Section End
    // ================

};
#endif // MAINWINDOW_H
