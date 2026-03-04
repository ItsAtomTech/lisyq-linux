#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QKeyEvent> // Needed for QKeyEvent
class QWebEngineView;  // Forward declaration
#include <QFileDialog>

#include <QWebChannel>
#include <QObject>
#include <QLineEdit>
#include <QWidgetAction>

#include "PortManager.h"

class NestWindow;


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
    void showTrackMenu();
    void showTemplateMenu();
    void showManualTemplateMenu();


protected:
    void keyPressEvent(QKeyEvent *event);
    void resizeEvent(QResizeEvent *event) override;


private slots:
    void on_actionOpen_triggered();
    void on_actionSave_triggered();
    void on_actionSave_As_triggered();

    void on_actionPort_Configuration_triggered();
    void on_actionDMX_Config_Patcher_triggered();
    void on_actionAdd_New_Track_triggered();
    void on_actionSettings_and_Option_triggered();
    void on_actionImport_Templates_triggered();
    void on_actionNew_triggered();

    //TAB Buttons on Top
    void onTimelineClicked();
    void onManualClicked();
    void setActiveButton(QPushButton *active);
    void openNestWindow();



    //Content Context Menu Action
    void onContextEdit();
    void onContextRemove();
    void onContextCopy();
    void onContextTrackOptions();
    void onContextAddToTemplate();


    //Track Context
    void handleAddTrack();
    void handleAddTrackAt();
    void duplicateAfter();
    void duplicateBefore();
    void duplicateAtPosition();
    void duplicateStart();
    void duplicateEnd();
    void editPortChannel();
    void removeTrack();
    void pasteContent();

    //Template Menu
    void editTemplate();
    void removeTemplate();
    void cancelTemplate();
    void sendToManualTemplate();


    //Manual Template Menu
    void onTemplateEdit();
    void onTemplateRemove();
    void onTemplateCancel();
    void onTemplateAddToTimeline();



private:
    Ui::MainWindow *ui;
    QWebEngineView *devTools; // Make devTools a member so it doesn’t go out of scope

    //Tab Buttons
    QPushButton *btnTimeline;
    QPushButton *btnManual;
    QPushButton *btnNest;

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

    NestWindow *nestWindow;



    // Context Menus
    QMenu *contextMenu_Sub;

    //Track Context
    QMenu *contextMenu_Track;
    QMenu *submenu_add_track_at;

    QLineEdit *trackIndexEdit;
    QWidgetAction *trackIndexWidgetAction;

    QMenu *submenu_duplicate;
    QMenu *submenu_duplicate_at;

    QLineEdit *duplicateIndexEdit;
    QWidgetAction *duplicateIndexWidgetAction;

    QMenu *submenu_edit_track;


    //Template Menu
    QMenu *template_menu;

    //Manual Template Menu
    QMenu *template_menu_manual;


};




#endif // MAINWINDOW_H
