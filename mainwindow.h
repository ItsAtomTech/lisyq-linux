#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QKeyEvent> // Needed for QKeyEvent
class QWebEngineView;  // Forward declaration
#include <QFileDialog>

#include <QWebChannel>
#include <QObject>

#include "PortManager.h"

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

    void Open_FileDirectory_Native();

    void Save_File();


    // ================
    // Ports and UDP Section
    // ================

    // Serial ports
    void addComPort(int index, const QString &portname);
    void removeComPort(int index);

    // UDP channels
    void addUdpChannel(int index, const QString &address, int port);
    void removeUdpChannel(int index);

    // JSON getters
    QString getSystemComPortsJson();
    QString getManagedPortsJson();
    QString getUdpListJson();


    void setDf(const QString &data);
    void outputs_v2();

    //Context Menu
    void showContentSubMenu();


protected:
    void keyPressEvent(QKeyEvent *event);
    void resizeEvent(QResizeEvent *event) override;


private slots:
    void on_actionOpen_triggered();
    void on_actionSave_triggered();

    void on_actionPort_Configuration_triggered();
    void on_actionDMX_Config_Patcher_triggered();


    //Content Context Menu Action
    void onContextEdit();
    void onContextRemove();
    void onContextCopy();
    void onContextTrackOptions();
    void onContextAddToTemplate();


private:
    Ui::MainWindow *ui;
    QWebEngineView *devTools; // Make devTools a member so it doesn’t go out of scope

    QWebEngineView *webView;

    PortManager *portManager;


    void openLSYSFile();


    // ================
    // File Management Section End
    // ================

    // Bridge Inject
    void injectWebChannelScript();
    void initializeWebChannel();
    void onReady();


    // Context Menus
    QMenu *contextMenu_Sub;


};




#endif // MAINWINDOW_H
