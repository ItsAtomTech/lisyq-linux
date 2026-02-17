#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QKeyEvent> // Needed for QKeyEvent
class QWebEngineView;  // Forward declaration
#include <QFileDialog>

#include <QWebChannel>
#include <QObject>


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


    QString data_string; //temp store for the data

    // ================
    // File Management Vars Section
    // ================
    QString SavePath;
    bool FromOpenFile;
    bool asNew;



    void Save_File();

protected:
    void keyPressEvent(QKeyEvent *event);


private slots:
    void on_actionOpen_triggered();
    void on_actionSave_triggered();




private:
    Ui::MainWindow *ui;
    QWebEngineView *devTools; // Make devTools a member so it doesn’t go out of scope

    QWebEngineView *webView;




    void openLSYSFile();


    // ================
    // File Management Section End
    // ================

    // Bridge Inject
    void injectWebChannelScript();
    void initializeWebChannel();
    void onReady();


};




#endif // MAINWINDOW_H
